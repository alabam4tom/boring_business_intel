import type { FastifyBaseLogger } from "fastify";

export interface MagicLinkEmail {
  email: string;
  url: string;
  token: string;
}

export async function sendMagicLinkEmail(
  logger: FastifyBaseLogger,
  payload: MagicLinkEmail,
): Promise<void> {
  // TODO (Story 1.5): wire to Resend/SendGrid via pg-boss email-send worker.
  logger.info(
    { email: payload.email, url: payload.url },
    "[auth] magic link (dev stub) — paste this URL into the browser to sign in",
  );
}
