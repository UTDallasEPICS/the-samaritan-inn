import { PrismaClient } from '@prisma/client';
import { buildUserCreateData } from '../src/lib/user-management.ts';

const prisma = new PrismaClient();

async function main() {
  // Seeded admin credentials for local testing:
  // email: admin@test.com
  // password: TestAdmin123!
  const adminData = await buildUserCreateData({
    firstName: 'Test',
    lastName: 'Admin',
    caseWorkerName: 'Jane Caseworker',
    salesforceAccountId: '001TESTADMIN000001',
    role: 'admin',
    email: 'admin@test.com',
    password: 'TestAdmin123!',
  });

  await prisma.user.upsert({
    where: { email: adminData.email },
    update: adminData,
    create: adminData,
  });
}

main()
  .catch(error => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
