// Run from samaritan_inn/: node prisma/add-mock-caseworkers.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const caseworkers = [
    { email: 'caseworker1@example.com', name: 'Caseworker 1' },
    { email: 'caseworker2@example.com', name: 'Caseworker 2' },
    { email: 'caseworker3@example.com', name: 'Caseworker 3' },
  ];

  for (const cw of caseworkers) {
    await prisma.user.upsert({
      where: { email: cw.email },
      update: {},
      create: {
        email: cw.email,
        name: cw.name,
        password: 'mock-hashed-password',
        role: 'admin',
      },
    });
    console.log(`Upserted caseworker: ${cw.name}`);
  }
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
