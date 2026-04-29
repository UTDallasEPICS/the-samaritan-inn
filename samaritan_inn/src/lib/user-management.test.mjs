import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PASSWORD_MIN_LENGTH,
  validateCreateUserInput,
} from './user-config.ts';
import {
  buildUserCreateData,
  createManagedUser,
  getUserCreationAccess,
  UserCreationError,
} from './user-management.ts';

const validInput = {
  firstName: 'Test',
  lastName: 'User',
  caseWorkerName: 'Jane Caseworker',
  salesforceAccountId: '001XXXXXXXXXXXXXXX',
  role: 'case_worker',
  email: 'testuser@example.com',
  password: 'TestUser123!',
};

test('unauthenticated users cannot access admin user creation', () => {
  assert.deepEqual(getUserCreationAccess(null), {
    ok: false,
    status: 401,
    message: 'Authentication is required',
  });
});

test('non-admin authenticated users receive a 403', () => {
  assert.deepEqual(getUserCreationAccess({ role: 'resident' }), {
    ok: false,
    status: 403,
    message: 'Admin access is required',
  });
});

test('admin authenticated users can access user creation', () => {
  assert.deepEqual(getUserCreationAccess({ role: 'admin' }), { ok: true });
});

test('required fields are validated', () => {
  const issues = validateCreateUserInput({
    firstName: '',
    lastName: '',
    caseWorkerName: '',
    salesforceAccountId: '',
    role: '',
    email: 'not-an-email',
    password: 'short',
  });

  const fields = issues.map(issue => issue.field);

  assert(fields.includes('firstName'));
  assert(fields.includes('lastName'));
  assert(fields.includes('caseWorkerName'));
  assert(fields.includes('salesforceAccountId'));
  assert(fields.includes('role'));
  assert(fields.includes('email'));
  assert(fields.includes('password'));
  assert.equal(
    issues.find(issue => issue.field === 'password')?.message,
    `Password must be at least ${PASSWORD_MIN_LENGTH} characters long`
  );
});

test('duplicate emails are rejected', async () => {
  const prisma = {
    user: {
      async findUnique() {
        return {
          id: 'existing-user',
          email: validInput.email,
          password: 'hashed-password',
          name: 'Existing User',
          role: 'resident',
          firstName: 'Existing',
          lastName: 'User',
          caseWorkerName: 'Existing Caseworker',
          salesforceAccountId: '001DUPLICATE',
        };
      },
      async create() {
        throw new Error('should not create when email already exists');
      },
    },
  };

  await assert.rejects(
    createManagedUser({ prisma, input: validInput }),
    error =>
      error instanceof UserCreationError &&
      error.status === 409 &&
      error.issues.some(issue => issue.field === 'email')
  );
});

test('admin user creation hashes passwords and persists all required fields', async () => {
  let createdUser = null;
  let hashedPasswordInput = '';

  const prisma = {
    user: {
      async findUnique() {
        return null;
      },
      async create({ data }) {
        createdUser = data;
        return {
          id: 'new-user',
          ...data,
        };
      },
    },
  };

  const user = await createManagedUser({
    prisma,
    input: validInput,
    hashPassword: async password => {
      hashedPasswordInput = password;
      return 'hashed-password';
    },
  });

  assert.equal(hashedPasswordInput, validInput.password);
  assert.equal(createdUser.password, 'hashed-password');
  assert.equal(createdUser.firstName, validInput.firstName);
  assert.equal(createdUser.lastName, validInput.lastName);
  assert.equal(createdUser.caseWorkerName, validInput.caseWorkerName);
  assert.equal(createdUser.salesforceAccountId, validInput.salesforceAccountId);
  assert.equal(createdUser.role, validInput.role);
  assert.equal(createdUser.email, validInput.email);
  assert.equal(createdUser.name, 'Test User');
  assert.equal(user.password, undefined);
});

test('buildUserCreateData normalizes email and role values', async () => {
  const data = await buildUserCreateData(
    {
      ...validInput,
      role: 'ADMIN',
      email: ' ADMIN@TEST.COM ',
    },
    async () => 'hashed-password'
  );

  assert.equal(data.role, 'admin');
  assert.equal(data.email, 'admin@test.com');
});
