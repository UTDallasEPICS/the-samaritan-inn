// Demo accounts for every role. Runs via `pnpm exec prisma db seed`, and on
// every stage deploy through the NPTS migration Lambda (stage only, see
// .github/workflows/deploy.yml). Never seed prod: these passwords are public.
//
// Re-running resets each account's name, role, and password so the demo
// logins always work, but leaves everything else (forms, appointments) alone.
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const users = [
  { email: 'admin@example.com', name: 'Demo Admin', role: 'admin', password: 'admin123' },
  { email: 'caseworker1@example.com', name: 'Case Worker 1', role: 'caseworker', password: 'caseworker123' },
  { email: 'caseworker2@example.com', name: 'Case Worker 2', role: 'caseworker', password: 'caseworker123' },
  { email: 'caseworker3@example.com', name: 'Case Worker 3', role: 'caseworker', password: 'caseworker123' },
  { email: 'resident1@example.com', name: 'Alex Johnson', role: 'resident', password: 'resident123' },
  { email: 'resident2@example.com', name: 'Maria Garcia', role: 'resident', password: 'resident123' },
];

async function main() {
  for (const { password, ...user } of users) {
    const data = { ...user, password: await bcrypt.hash(password, 10) };
    await prisma.user.upsert({ where: { email: user.email }, update: data, create: data });
    console.log(`Seeded ${user.role}: ${user.email}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
