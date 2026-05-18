import type PgBoss from "pg-boss";
import { db } from "@repo/db";
import { getBoss } from "./index.js";

function buildReEngagementHtml(name: string): string {
  const appUrl = process.env.APP_URL ?? "https://app.boringbusinessintel.com";
  return `
    <p>Hi ${name},</p>
    <p>We haven't seen you in a while! Your segment is growing — new agencies have joined and your benchmark comparisons have been updated.</p>
    <p><a href="${appUrl}/dashboard">See how your agency compares →</a></p>
    <p>The BoringBusinessIntel team</p>
  `;
}

export async function reEngagementWorker(jobs: PgBoss.Job[]): Promise<void> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  // Find all orgs with KPI submissions, deduplicate by org
  const allSubmissions = await db.query.kpiSubmissions.findMany({
    columns: { organizationId: true },
  });

  const orgIds = [...new Set(allSubmissions.map((s) => s.organizationId))];

  console.info({ orgCount: orgIds.length }, "[re-engagement] processing orgs");

  let enqueued = 0;
  for (const orgId of orgIds) {
    try {
      const membership = await db.query.organizationMembers.findFirst({
        where: (m, { and, eq }) => and(eq(m.organizationId, orgId), eq(m.role, "owner")),
      });
      if (!membership) continue;

      // Skip if user has had any session activity in the last 30 days
      const recentSession = await db.query.session.findFirst({
        where: (s, { and, eq, gt }) => and(
          eq(s.userId, membership.userId),
          gt(s.updatedAt, thirtyDaysAgo),
        ),
      });
      if (recentSession) continue;

      const owner = await db.query.user.findFirst({
        where: (u, { eq }) => eq(u.id, membership.userId),
      });
      if (!owner) continue;

      await getBoss().send("email-send", {
        to: owner.email,
        subject: "How does your agency compare this month?",
        html: buildReEngagementHtml(owner.name ?? "there"),
      });
      enqueued++;
    } catch (err) {
      console.error({ orgId, err }, "[re-engagement] failed to process org — skipping");
    }
  }

  console.info({ enqueued }, "[re-engagement] email jobs queued");
}
