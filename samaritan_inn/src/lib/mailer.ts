import nodemailer from 'nodemailer';

// SMTP settings come from the environment (see DEVELOPMENT.md). When SMTP_HOST is not set
// (local dev) the message is printed to the server log instead of being sent, so the
// reset link can still be copied from the terminal.
type Mail = { to: string; subject: string; text: string };

export function isMailConfigured(): boolean {
  return !!process.env.SMTP_HOST;
}

export async function sendMail({ to, subject, text }: Mail): Promise<boolean> {
  if (!isMailConfigured()) {
    console.warn(`[mailer] SMTP_HOST not set; not sending. To: ${to}\n${subject}\n${text}`);
    return false;
  }

  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
      : undefined,
  });

  try {
    await transport.sendMail({
      from: process.env.MAIL_FROM ?? process.env.SMTP_USER,
      to,
      subject,
      text,
    });
    return true;
  } catch (error) {
    console.error('[mailer] send failed:', error);
    return false;
  }
}
