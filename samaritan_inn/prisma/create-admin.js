// Creates (or promotes) a single admin account. Use this to bootstrap the first
// admin on an environment where prisma/seed.js must NOT run (prod), since public
// sign-up no longer exists.
//
//   ADMIN_EMAIL=dev@example.com ADMIN_PASSWORD='long-random-password' pnpm run create-admin
//   (optional: ADMIN_NAME="Dev Admin")
//
// Re-running with the same email resets that account's password and role to admin.
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || '';
  const name = (process.env.ADMIN_NAME || 'Admin').trim();

  if (!email || password.length < 12) {
    throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD (at least 12 characters).');
  }

  const data = { email, name, role: 'admin', password: await bcrypt.hash(password, 10) };
  await prisma.user.upsert({ where: { email }, update: data, create: data });
  console.log(`Admin ready: ${email}`);
}

main()
  .catch((e) => {
    console.error(e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
