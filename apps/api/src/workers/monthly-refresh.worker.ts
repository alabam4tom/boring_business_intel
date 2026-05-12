import type PgBoss from "pg-boss";
import { db } from "@repo/db";
import { getBoss } from "./index.js";
import type { CodatSyncPayload } from "./index.js";

export async function monthlyRefreshWorker(jobs: PgBoss.Job[]): Promise<void> {
  const linked = await db.query.codatConnections.findMany({
    where: (c, { and, eq, isNotNull }) =>
      and(eq(c.status, "linked"), isNotNull(c.codatConnectionId)),
  });

  let enqueued = 0;
  for (const conn of linked) {
    const payload: CodatSyncPayload = {
      organizationId: conn.organizationId,
      codatConnectionId: conn.codatConnectionId!,
      codatCompanyId: conn.codatCompanyId,
      triggeredBy: "scheduled",
    };
    await getBoss().send("codat-sync", payload);
    enqueued++;
  }

  console.info({ enqueued }, "[monthly-refresh] codat-sync jobs enqueued");
}
