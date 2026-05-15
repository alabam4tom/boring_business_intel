import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { magicLink } from "better-auth/plugins";
import { db } from "@repo/db";
import * as schema from "@repo/db/schema";
import { uuidv7 } from "uuidv7";
import type { FastifyBaseLogger } from "fastify";
import { sendMagicLinkEmail } from "../services/email.js";
import { getBoss, type EmailSendPayload } from "../workers/index.js";

const trustedOrigins = (process.env.CORS_ORIGIN ?? "http://localhost:3000")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

export function createAuth(logger: FastifyBaseLogger) {
  return betterAuth({
    baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3001",
    secret: process.env.BETTER_AUTH_SECRET,
    database: drizzleAdapter(db, {
      provider: "pg",
      schema: {
        user: schema.user,
        session: schema.session,
        account: schema.account,
        verification: schema.verification,
      },
    }),
    advanced: {
      database: {
        generateId: () => uuidv7(),
      },
    },
    session: {
      expiresIn: 60 * 60 * 24,
      updateAge: 60 * 60,
    },
    trustedOrigins,
    socialProviders:
      googleClientId && googleClientSecret
        ? {
            google: {
              clientId: googleClientId,
              clientSecret: googleClientSecret,
            },
          }
        : {},
    plugins: [
      magicLink({
        sendMagicLink: async ({ email, url, token }) => {
          await sendMagicLinkEmail(logger, { email, url, token });
        },
      }),
    ],
    databaseHooks: {
      user: {
        create: {
          after: async (user) => {
            const appUrl = process.env.APP_URL ?? "http://localhost:3000";
            try {
              const payload: EmailSendPayload = {
                to: user.email,
                subject: "Welcome to BoringBusinessIntel",
                html: `<p>Hi ${user.name ?? "there"},</p><p>Welcome to BoringBusinessIntel! You're on your way to benchmarking your agency's performance against peers.</p><p><a href="${appUrl}/onboarding">Start your setup →</a></p><p>The BoringBusinessIntel team</p>`,
              };
              await getBoss().send("email-send", payload);
            } catch (err) {
              logger.warn({ userId: user.id, email: user.email, err }, "[auth] failed to queue welcome email");
            }
          },
        },
      },
    },
  });
}

export type Auth = ReturnType<typeof createAuth>;
