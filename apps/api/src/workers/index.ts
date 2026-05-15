import PgBoss from "pg-boss";
import { codatSyncWorker } from "./codat-sync.worker.js";
import { tokenRefreshWorker } from "./token-refresh.worker.js";
import { monthlyRefreshWorker } from "./monthly-refresh.worker.js";
import { emailSendWorker } from "./email-send.worker.js";

export interface CodatSyncPayload {
  organizationId: string;
  codatConnectionId: string;
  codatCompanyId: string;
  triggeredBy: "webhook" | "manual" | "scheduled";
}

import type { EmailSendPayload } from "../services/email.js";
export type { EmailSendPayload } from "../services/email.js";

let boss: PgBoss | undefined;

export async function initWorkers(): Promise<PgBoss> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL is required for pg-boss");

  boss = new PgBoss(databaseUrl);
  boss.on("error", (error) => console.error("[pg-boss] error:", error));

  await boss.start();

  // Set queue-level retry defaults for codat-sync (resolves deferred W11)
  // 3 retries with exponential backoff: 5 min → 10 min → 20 min
  await boss.createQueue("codat-sync", {
    name: "codat-sync",
    retryLimit: 3,
    retryDelay: 300,
    retryBackoff: true,
  });

  await boss.createQueue("email-send", {
    name: "email-send",
    retryLimit: 3,
    retryDelay: 60,
    retryBackoff: true,
  });

  // Register workers — codat-sync uses includeMetadata to detect final retry
  await boss.work<CodatSyncPayload>("codat-sync", { includeMetadata: true }, codatSyncWorker);
  await boss.work("daily-token-refresh", tokenRefreshWorker);
  await boss.work("monthly-codat-refresh", monthlyRefreshWorker);
  await boss.work<EmailSendPayload>("email-send", emailSendWorker);

  // Scheduled jobs — idempotent, safe to call on every server start
  await boss.schedule("monthly-codat-refresh", "0 2 1 * *", {});
  await boss.schedule("daily-token-refresh", "0 3 * * *", {});

  console.info("[pg-boss] workers started");
  return boss;
}

export function getBoss(): PgBoss {
  if (!boss) throw new Error("Workers not initialized — call initWorkers() first");
  return boss;
}
