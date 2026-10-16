// Run from samaritan_inn/: node prisma/add-mock-residents.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const residents = [
    { email: 'resident1@example.com', name: 'Alex Johnson' },
    { email: 'resident2@example.com', name: 'Maria Garcia' },
  ];

  for (const r of residents) {
    await prisma.user.upsert({
      where: { email: r.email },
      update: {},
      create: {
        email: r.email,
        name: r.name,
        password: 'mock-hashed-password',
        role: 'resident',
      },
    });
    console.log(`Upserted resident: ${r.name}`);
  }
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
