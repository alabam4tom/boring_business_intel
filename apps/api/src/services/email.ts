import type { FastifyBaseLogger } from "fastify";

export interface MagicLinkEmail {
  email: string;
  url: string;
  token: string;
}

export interface EmailSendPayload {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(logger: FastifyBaseLogger, payload: EmailSendPayload): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    logger.warn({ to: payload.to }, "[email] RESEND_API_KEY not set — skipping email");
    return;
  }
  const from = process.env.EMAIL_FROM ?? "noreply@boringbusinessintel.com";
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: payload.to, subject: payload.subject, html: payload.html }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    logger.error({ to: payload.to, status: res.status, body }, "[email] Resend API error");
    throw new Error(`Resend API returned ${res.status}`);
  }
}

export async function sendMagicLinkEmail(
  logger: FastifyBaseLogger,
  payload: MagicLinkEmail,
): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    logger.warn({ email: payload.email, magicLinkUrl: payload.url }, "[email] DEV MODE — magic link (copy this URL to sign in)");
    return;
  }
  await sendEmail(logger, {
    to: payload.email,
    subject: "Your BoringBusinessIntel sign-in link",
    html: `<p>Click the link below to sign in. This link expires in 10 minutes.</p><p><a href="${payload.url}">Sign in →</a></p>`,
  });
}
