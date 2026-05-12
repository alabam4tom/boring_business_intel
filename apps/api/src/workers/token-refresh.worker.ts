import type PgBoss from "pg-boss";
import { db } from "@repo/db";
import { codatConnections } from "@repo/db/schema";
import { eq } from "drizzle-orm";
import { getConnectionStatus } from "../services/codat-client.js";

export async function tokenRefreshWorker(jobs: PgBoss.Job[]): Promise<void> {
  const linked = await db.query.codatConnections.findMany({
    where: (c, { eq: eqFn }) => eqFn(c.status, "linked"),
  });

  console.info({ count: linked.length }, "[token-refresh] checking connections");

  for (const conn of linked) {
    if (!conn.codatConnectionId) continue;
    try {
      const status = await getConnectionStatus(conn.codatCompanyId, conn.codatConnectionId);
      if (status === "Deauthorized" || status === "PendingAuth") {
        await db
          .update(codatConnections)
          .set({ status: "deauthorized", updatedAt: new Date() })
          .where(eq(codatConnections.id, conn.id));
        console.warn(
          { organizationId: conn.organizationId, codatCompanyId: conn.codatCompanyId, codatStatus: status },
          "[token-refresh] connection deauthorized — local status updated"
        );
      }
    } catch (err) {
      console.error(
        { organizationId: conn.organizationId, codatCompanyId: conn.codatCompanyId, err },
        "[token-refresh] failed to check connection status — skipping"
      );
    }
  }

  console.info({ checked: linked.length }, "[token-refresh] complete");
}
