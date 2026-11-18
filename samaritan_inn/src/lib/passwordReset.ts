import { createHash, randomBytes } from 'crypto';
import { prisma } from '@/lib/prisma';
import { sendMail } from '@/lib/mailer';

// Reset links reuse NextAuth's VerificationToken table (identifier = email).
// Only a SHA-256 hash of the token is stored, so a database leak can't be used to reset
// passwords; the plaintext token exists only in the emailed link.
const hash = (token: string) => createHash('sha256').update(token).digest('hex');

export const RESET_TTL_MINUTES = 60;
export const INVITE_TTL_MINUTES = 60 * 72;

async function createResetToken(email: string, ttlMinutes: number): Promise<string> {
  const token = randomBytes(32).toString('hex');
  // One live link per account: a new request invalidates earlier ones. Also sweep
  // expired tokens from every account so the table doesn't grow forever.
  await prisma.verificationToken.deleteMany({
    where: { OR: [{ identifier: email }, { expires: { lt: new Date() } }] },
  });
  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token: hash(token),
      expires: new Date(Date.now() + ttlMinutes * 60_000),
    },
  });
  return token;
}

function resetUrl(token: string, email: string): string {
  const base = (process.env.NEXTAUTH_URL ?? 'http://localhost:3000').replace(/\/$/, '');
  return `${base}/auth/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
}

// Per-email cooldown so the forgot-password form can't be used to flood a resident's
// inbox, or to keep invalidating the link they were just sent. In-memory is enough for
// the single-server deployment; a restart only resets the cooldown.
const RESET_COOLDOWN_MS = 60_000;
const lastResetRequest = new Map<string, number>();

export function isResetThrottled(email: string): boolean {
  const now = Date.now();
  for (const [key, at] of lastResetRequest) {
    if (now - at >= RESET_COOLDOWN_MS) lastResetRequest.delete(key);
  }
  if (lastResetRequest.has(email)) return true;
  lastResetRequest.set(email, now);
  return false;
}

export async function sendPasswordResetEmail(email: string): Promise<boolean> {
  const token = await createResetToken(email, RESET_TTL_MINUTES);
  return sendMail({
    to: email,
    subject: 'Reset your Samaritan Inn password',
    text:
      `We received a request to reset your Samaritan Inn password.\n\n` +
      `Choose a new password here (the link works for ${RESET_TTL_MINUTES} minutes):\n` +
      `${resetUrl(token, email)}\n\n` +
      `If you didn't ask for this, you can ignore this email; your password won't change.`,
  });
}

export async function sendAccountSetupEmail(email: string, name: string): Promise<boolean> {
  const token = await createResetToken(email, INVITE_TTL_MINUTES);
  return sendMail({
    to: email,
    subject: 'Your Samaritan Inn account is ready',
    text:
      `Hi ${name},\n\n` +
      `An account was created for you at The Samaritan Inn.\n\n` +
      `Set your own password here (the link works for ${INVITE_TTL_MINUTES / 60} hours):\n` +
      `${resetUrl(token, email)}\n\n` +
      `You can also log in with the temporary password your case worker gave you, ` +
      `but please choose your own as soon as you can.`,
  });
}

// Returns true when the token is valid for this email and was consumed. The check and
// the delete are one statement, so two simultaneous requests can't both redeem a link.
export async function consumeResetToken(email: string, token: string): Promise<boolean> {
  const { count } = await prisma.verificationToken.deleteMany({
    where: { identifier: email, token: hash(token), expires: { gt: new Date() } },
  });
  return count === 1;
}
