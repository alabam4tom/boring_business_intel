import PgBoss from "pg-boss";
import { codatSyncWorker } from "./codat-sync.worker.js";

export interface CodatSyncPayload {
  organizationId: string;
  codatConnectionId: string;
  codatCompanyId: string;
  triggeredBy: "webhook" | "manual" | "scheduled";
}

let boss: PgBoss | undefined;

export async function initWorkers(): Promise<PgBoss> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL is required for pg-boss");

  boss = new PgBoss(databaseUrl);
  boss.on("error", (error) => console.error("[pg-boss] error:", error));

  await boss.start();

  await boss.work<CodatSyncPayload>("codat-sync", codatSyncWorker);

  console.info("[pg-boss] workers started");
  return boss;
}

export function getBoss(): PgBoss {
  if (!boss) throw new Error("Workers not initialized — call initWorkers() first");
  return boss;
}
