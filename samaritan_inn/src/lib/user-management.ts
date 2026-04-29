import bcrypt from "bcryptjs";
import {
  formatDisplayName,
  normalizeCreateUserInput,
  type CreateUserInput,
  type ValidationIssue,
  validateCreateUserInput,
} from "./user-config.ts";

type SessionLike = { role: string } | null;

type UserRecord = {
  id: string;
  email: string;
  password: string;
  name: string;
  role: string;
  firstName: string | null;
  lastName: string | null;
  caseWorkerName: string | null;
  salesforceAccountId: string | null;
};

type UserStore = {
  user: {
    findUnique(args: { where: { email: string } }): Promise<UserRecord | null>;
    create(args: {
      data: {
        email: string;
        password: string;
        name: string;
        role: string;
        firstName: string;
        lastName: string;
        caseWorkerName: string;
        salesforceAccountId: string;
      };
    }): Promise<UserRecord>;
  };
};

export type UserCreationAccessResult =
  | { ok: true }
  | { ok: false; status: 401 | 403; message: string };

export class UserCreationError extends Error {
  status: number;
  issues: ValidationIssue[];

  constructor(message: string, status: number, issues: ValidationIssue[] = []) {
    super(message);
    this.name = "UserCreationError";
    this.status = status;
    this.issues = issues;
  }
}

export function getUserCreationAccess(
  session: SessionLike
): UserCreationAccessResult {
  if (!session) {
    return {
      ok: false,
      status: 401,
      message: "Authentication is required",
    };
  }

  if (session.role !== "admin") {
    return {
      ok: false,
      status: 403,
      message: "Admin access is required",
    };
  }

  return { ok: true };
}

export async function hashUserPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function buildUserCreateData(
  input: Partial<CreateUserInput>,
  hashPassword: (password: string) => Promise<string> = hashUserPassword
) {
  const normalized = normalizeCreateUserInput(input);
  const issues = validateCreateUserInput(normalized);

  if (issues.length > 0) {
    throw new UserCreationError("Validation failed", 400, issues);
  }

  return {
    firstName: normalized.firstName,
    lastName: normalized.lastName,
    caseWorkerName: normalized.caseWorkerName,
    salesforceAccountId: normalized.salesforceAccountId,
    role: normalized.role,
    email: normalized.email,
    password: await hashPassword(normalized.password),
    name: formatDisplayName(normalized.firstName, normalized.lastName),
  };
}

export async function createManagedUser({
  prisma,
  input,
  hashPassword,
}: {
  prisma: UserStore;
  input: Partial<CreateUserInput>;
  hashPassword?: (password: string) => Promise<string>;
}) {
  const data = await buildUserCreateData(input, hashPassword);
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new UserCreationError("User already exists with this email", 409, [
      { field: "email", message: "Email is already in use" },
    ]);
  }

  const user = await prisma.user.create({ data });
  const { password: removedPassword, ...safeUser } = user;

  void removedPassword;

  return safeUser;
}
