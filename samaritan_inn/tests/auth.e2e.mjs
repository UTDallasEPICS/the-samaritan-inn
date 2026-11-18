// End-to-end tests for admin account creation, login, email confirmation and
// password reset. Runs against a live server and the same database it uses.
//
//   pnpm seed            # once: creates admin@example.com, resident1@example.com, ...
//   pnpm dev             # in another terminal
//   pnpm test:auth       # BASE_URL defaults to http://localhost:3000
//
// It creates throwaway accounts (auth-test-*@example.com) and deletes them at the end.
// Never run it against production: it needs the seeded demo accounts.
import { createHash } from 'crypto';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const BASE = (process.env.BASE_URL ?? 'http://localhost:3000').replace(/\/$/, '');
const RUN = Date.now();
const testEmail = (name) => `auth-test-${name}-${RUN}@example.com`;
const sha = (t) => createHash('sha256').update(t).digest('hex');

let passed = 0;
const failures = [];
function check(name, actual, expected) {
  if (actual === expected) {
    passed++;
    console.log(`  ✓ ${name}`);
  } else {
    failures.push(name);
    console.log(`  ✗ ${name}\n      expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}
const section = (title) => console.log(`\n${title}`);

async function request(method, path, { body, cookie, raw } = {}) {
  const res = await fetch(BASE + path, {
    method,
    redirect: 'manual',
    headers: { 'Content-Type': 'application/json', ...(cookie ? { cookie } : {}) },
    body: raw ?? (body === undefined ? undefined : JSON.stringify(body)),
  });
  let json = null;
  try { json = await res.json(); } catch { /* not JSON */ }
  return { status: res.status, json, headers: res.headers };
}

// Logs in through NextAuth's credentials endpoint; returns the session cookie and user.
async function login(email, password) {
  const csrf = await fetch(BASE + '/api/auth/csrf');
  let jar = csrf.headers.getSetCookie().map((c) => c.split(';')[0]);
  const { csrfToken } = await csrf.json();
  const res = await fetch(BASE + '/api/auth/callback/credentials', {
    method: 'POST',
    redirect: 'manual',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', cookie: jar.join('; ') },
    body: new URLSearchParams({ csrfToken, email, password, json: 'true' }),
  });
  jar = [...jar, ...res.headers.getSetCookie().map((c) => c.split(';')[0])];
  const cookie = jar.join('; ');
  const session = await (await fetch(BASE + '/api/auth/session', { headers: { cookie } })).json();
  return { cookie, user: session?.user ?? null };
}
const canLogIn = async (email, password) => (await login(email, password)).user !== null;

// Replaces the account's reset token with one whose plaintext we know.
async function plantToken(email, raw, msFromNow) {
  await prisma.verificationToken.deleteMany({ where: { identifier: email } });
  await prisma.verificationToken.create({
    data: { identifier: email, token: sha(raw), expires: new Date(Date.now() + msFromNow) },
  });
}
const tokenFor = (email) => prisma.verificationToken.findFirst({ where: { identifier: email } });
const minutesLeft = (t) => Math.round((t.expires.getTime() - Date.now()) / 60000);
const reset = (email, token, password) => request('POST', '/api/password/reset', { body: { email, token, password } });

async function main() {
  try {
    await fetch(BASE + '/api/auth/csrf');
  } catch {
    throw new Error(`No server at ${BASE}. Start it with "pnpm dev" first.`);
  }
  const admin = await login('admin@example.com', 'admin123');
  if (admin.user?.role !== 'admin') {
    throw new Error('Could not log in as admin@example.com / admin123. Run "pnpm seed" first.');
  }
  const resident = await login('resident1@example.com', 'resident123');
  const caseworker = await login('caseworker1@example.com', 'caseworker123');

  section('Access control');
  const someone = { name: 'Nobody', email: testEmail('nobody') };
  check('logged out cannot create accounts (401)', (await request('POST', '/api/admin/residents', { body: someone })).status, 401);
  check('resident cannot create accounts (403)', (await request('POST', '/api/admin/residents', { body: someone, cookie: resident.cookie })).status, 403);
  check('caseworker cannot create accounts (403)', (await request('POST', '/api/admin/residents', { body: someone, cookie: caseworker.cookie })).status, 403);
  check('resident cannot list users (403)', (await request('GET', '/api/users', { cookie: resident.cookie })).status, 403);
  check('resident cannot change roles (403)', (await request('PATCH', '/api/users/x/role', { body: { role: 'admin' }, cookie: resident.cookie })).status, 403);
  check('resident cannot resend setup emails (403)', (await request('POST', '/api/users/x/setup-email', { cookie: resident.cookie })).status, 403);
  const page = await fetch(BASE + '/admin-users/create', { headers: { cookie: resident.cookie }, redirect: 'manual' });
  check('resident is redirected away from /admin-users/create', page.status >= 300 && page.status < 400, true);

  section('Admin creates a resident');
  const email = testEmail('resident');
  check('invalid name/email rejected (400)', (await request('POST', '/api/admin/residents', { body: { name: '', email: 'nope' }, cookie: admin.cookie })).status, 400);
  const created = await request('POST', '/api/admin/residents', { body: { name: 'Auth Test', email: email.toUpperCase() }, cookie: admin.cookie });
  check('account created (201)', created.status, 201);
  check('12-character temporary password returned', created.json?.tempPassword?.length, 12);
  check('email stored lowercase', created.json?.user?.email, email);
  check('no password hash in the response', JSON.stringify(created.json).includes('$2'), false);
  check('duplicate email rejected (409)', (await request('POST', '/api/admin/residents', { body: { name: 'Dup', email }, cookie: admin.cookie })).status, 409);
  const setupToken = await tokenFor(email);
  check('setup link issued, valid for 72 hours', setupToken && minutesLeft(setupToken), 72 * 60);
  const tempPassword = created.json.tempPassword;
  check('resident can log in with the temporary password', (await login(email, tempPassword)).user?.role, 'resident');
  check('login ignores email capitalization', await canLogIn(email.toUpperCase(), tempPassword), true);

  section('Resident creates their own password from the setup link');
  let users = (await request('GET', '/api/users', { cookie: admin.cookie })).json;
  let me = users.find((u) => u.email === email);
  check('not marked as confirmed yet', me.emailVerified, null);
  await plantToken(email, 'a'.repeat(64), 72 * 3600e3);
  check('setup link sets the password', (await reset(email, 'a'.repeat(64), 'MyOwnPass99')).status, 200);
  check('logs in with the new password', await canLogIn(email, 'MyOwnPass99'), true);
  check('temporary password no longer works', await canLogIn(email, tempPassword), false);
  me = (await request('GET', '/api/users', { cookie: admin.cookie })).json.find((u) => u.email === email);
  check('now marked as confirmed', typeof me.emailVerified, 'string');
  check('cannot resend setup email once confirmed (409)', (await request('POST', `/api/users/${me.id}/setup-email`, { cookie: admin.cookie })).status, 409);

  section('Admin resends the setup email');
  const email2 = testEmail('resend');
  const created2 = await request('POST', '/api/admin/residents', { body: { name: 'Resend Test', email: email2 }, cookie: admin.cookie });
  const id2 = created2.json.user.id;
  const firstHash = (await tokenFor(email2)).token;
  check('unknown user (404)', (await request('POST', '/api/users/does-not-exist/setup-email', { cookie: admin.cookie })).status, 404);
  check('resend succeeds (200)', (await request('POST', `/api/users/${id2}/setup-email`, { cookie: admin.cookie })).status, 200);
  const tokens2 = await prisma.verificationToken.findMany({ where: { identifier: email2 } });
  check('old link replaced by a new one', tokens2.length === 1 && tokens2[0].token !== firstHash, true);

  section('Forgot password');
  check('invalid email rejected (400)', (await request('POST', '/api/password/forgot', { body: { email: 'nope' } })).status, 400);
  const unknown = await request('POST', '/api/password/forgot', { body: { email: testEmail('unknown') } });
  const known = await request('POST', '/api/password/forgot', { body: { email } });
  check('same response for unknown and real accounts', JSON.stringify(known.json), JSON.stringify(unknown.json));
  await new Promise((r) => setTimeout(r, 300)); // the email is sent in the background
  const resetToken = await tokenFor(email);
  check('reset link issued, valid for 60 minutes', resetToken && minutesLeft(resetToken), 60);
  check('token stored hashed (64 hex chars)', /^[0-9a-f]{64}$/.test(resetToken.token), true);
  await request('POST', '/api/password/forgot', { body: { email } });
  await new Promise((r) => setTimeout(r, 300));
  check('repeat request within 60s ignored (link unchanged)', (await tokenFor(email)).token, resetToken.token);
  const resetPage = await fetch(`${BASE}/auth/reset-password?token=x&email=x`);
  check('reset page sends Referrer-Policy: no-referrer', resetPage.headers.get('referrer-policy'), 'no-referrer');

  section('Bad reset attempts are rejected');
  await plantToken(email, 'b'.repeat(64), 3600e3);
  check('wrong token', (await reset(email, 'c'.repeat(64), 'Hacked1234')).status, 400);
  check("valid token used for someone else's email", (await reset(email2, 'b'.repeat(64), 'Hacked1234')).status, 400);
  check('missing token', (await request('POST', '/api/password/reset', { body: { email, password: 'Hacked1234' } })).status, 400);
  check('password shorter than 8', (await reset(email, 'b'.repeat(64), 'short')).status, 400);
  check('password longer than 72 bytes', (await reset(email, 'b'.repeat(64), 'x'.repeat(80))).status, 400);
  check('malformed JSON', (await request('POST', '/api/password/reset', { raw: '{nope' })).status, 400);
  check('password unchanged after failed attempts', await canLogIn(email, 'MyOwnPass99'), true);
  await plantToken(email, 'd'.repeat(64), -1000);
  check('expired link', (await reset(email, 'd'.repeat(64), 'Expired123')).status, 400);
  await plantToken(email, 'e'.repeat(64), 3600e3);
  await plantToken(email, 'f'.repeat(64), 3600e3);
  check('older link rejected once a newer one exists', (await reset(email, 'e'.repeat(64), 'Older12345')).status, 400);

  section('Successful reset');
  check('valid link resets the password', (await reset(email, 'f'.repeat(64), 'NewPass456')).status, 200);
  check('new password works', await canLogIn(email, 'NewPass456'), true);
  check('old password no longer works', await canLogIn(email, 'MyOwnPass99'), false);
  check('link cannot be reused', (await reset(email, 'f'.repeat(64), 'Again12345')).status, 400);
  await plantToken(email, '9'.repeat(64), 3600e3);
  const race = await Promise.all([1, 2, 3, 4, 5].map((i) => reset(email, '9'.repeat(64), `Race${i}Pass99`)));
  check('5 simultaneous uses of one link: exactly one succeeds', race.filter((r) => r.status === 200).length, 1);

  section('Role management');
  const adminId = users.find((u) => u.email === 'admin@example.com').id;
  check('invalid role rejected (400)', (await request('PATCH', `/api/users/${id2}/role`, { body: { role: 'superuser' }, cookie: admin.cookie })).status, 400);
  check('unknown user (404, not a crash)', (await request('PATCH', '/api/users/does-not-exist/role', { body: { role: 'admin' }, cookie: admin.cookie })).status, 404);
  check('admin can promote a resident to caseworker', (await request('PATCH', `/api/users/${id2}/role`, { body: { role: 'caseworker' }, cookie: admin.cookie })).status, 200);
  const selfDemote = await request('PATCH', `/api/users/${adminId}/role`, { body: { role: 'resident' }, cookie: admin.cookie });
  check('admin cannot remove their own admin role (409)', selfDemote.status, 409);
  users = (await request('GET', '/api/users', { cookie: admin.cookie })).json;
  check('admin is still an admin', users.find((u) => u.id === adminId).role, 'admin');
}

async function cleanup() {
  const where = { email: { startsWith: 'auth-test-', endsWith: `-${RUN}@example.com` } };
  const emails = (await prisma.user.findMany({ where, select: { email: true } })).map((u) => u.email);
  await prisma.verificationToken.deleteMany({ where: { identifier: { in: emails } } });
  await prisma.user.deleteMany({ where });
}

try {
  await main();
} catch (error) {
  failures.push(error.message);
  console.error(`\nStopped: ${error.message}`);
} finally {
  await cleanup().catch((e) => console.error('Cleanup failed:', e.message));
  await prisma.$disconnect();
}
console.log(`\n${passed} passed, ${failures.length} failed`);
process.exit(failures.length ? 1 : 0);
