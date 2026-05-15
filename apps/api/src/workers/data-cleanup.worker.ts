import type PgBoss from "pg-boss";
import { db } from "@repo/db";
import {
  invitations,
  dataQualityScores,
  kpiSubmissions,
  codatConnections,
  organizationMembers,
  organizations,
  user as userTable,
  session as sessionTable,
  account as accountTable,
  verification as verificationTable,
} from "@repo/db/schema";
import { eq } from "drizzle-orm";
import { getBoss } from "./index.js";

export interface DataCleanupPayload {
  userId: string;
  email: string;
  organizationId: string | null;
}

export async function dataCleanupWorker(jobs: PgBoss.Job<DataCleanupPayload>[]): Promise<void> {
  for (const job of jobs) {
    try {
      await runCleanup(job.data);
    } catch (err) {
      console.error({ jobId: job.id, ...job.data, err }, "[data-cleanup] job failed");
      throw err;
    }
  }
}

async function runCleanup(payload: DataCleanupPayload): Promise<void> {
  const { userId, email, organizationId } = payload;

  if (organizationId) {
    console.info({ organizationId }, "[data-cleanup] deleting org data");
    await db.delete(invitations).where(eq(invitations.organizationId, organizationId));
    await db.delete(dataQualityScores).where(eq(dataQualityScores.organizationId, organizationId));
    await db.delete(kpiSubmissions).where(eq(kpiSubmissions.organizationId, organizationId));
    await db.delete(codatConnections).where(eq(codatConnections.organizationId, organizationId));
    await db.delete(organizationMembers).where(eq(organizationMembers.organizationId, organizationId));
    await db.delete(organizations).where(eq(organizations.id, organizationId));
    console.info({ organizationId }, "[data-cleanup] org data deleted");
  }

  console.info({ userId }, "[data-cleanup] deleting user auth data");
  await db.delete(verificationTable).where(eq(verificationTable.identifier, email));
  await db.delete(sessionTable).where(eq(sessionTable.userId, userId));
  await db.delete(accountTable).where(eq(accountTable.userId, userId));
  await db.delete(userTable).where(eq(userTable.id, userId));
  console.info({ userId }, "[data-cleanup] user deleted");

  // Send confirmation email (best-effort — email address no longer in DB but payload has it)
  try {
    await getBoss().send("email-send", {
      to: email,
      subject: "Your BoringBusinessIntel data has been deleted",
      html: `<p>Hi,</p><p>Your account and all associated data have been permanently deleted from BoringBusinessIntel as requested.</p><p>If you did not request this, please contact us immediately.</p><p>The BoringBusinessIntel team</p>`,
    });
  } catch (err) {
    console.warn({ email, err }, "[data-cleanup] failed to queue confirmation email — deletion already complete");
  }
}
