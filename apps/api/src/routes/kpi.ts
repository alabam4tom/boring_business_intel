import type { FastifyInstance } from "fastify";
import { fromNodeHeaders } from "better-auth/node";
import { db } from "@repo/db";
import { kpiSubmissions } from "@repo/db/schema";
import { submitKpiSchema } from "@repo/shared/schemas/kpi";
import { uuidv7 } from "uuidv7";
import { eq, and } from "drizzle-orm";

export async function kpiRoutes(app: FastifyInstance) {
  app.post("/api/v1/kpi-submissions", async (request, reply) => {
    const session = await app.auth.api.getSession({
      headers: fromNodeHeaders(request.headers),
    });
    if (!session?.user) {
      return reply.status(401).send({ error: { code: "UNAUTHORIZED", message: "Not authenticated" } });
    }

    const result = submitKpiSchema.safeParse(request.body);
    if (!result.success) {
      return reply.status(400).send({ error: { code: "VALIDATION_ERROR", message: result.error.flatten() } });
    }

    const membership = await db.query.organizationMembers.findFirst({
      where: (m, { eq }) => eq(m.userId, session.user.id),
    });
    if (!membership) {
      return reply.status(403).send({ error: { code: "NO_ORG", message: "User has no organization" } });
    }

    const { periodYear, revenueGrowth, grossMargin, netMargin } = result.data;

    const existing = await db.query.kpiSubmissions.findFirst({
      where: (k, { and, eq }) => and(
        eq(k.organizationId, membership.organizationId),
        eq(k.periodYear, periodYear),
      ),
    });
    if (existing) {
      return reply.status(409).send({ error: { code: "ALREADY_SUBMITTED", message: `KPIs for ${periodYear} already submitted` } });
    }

    const submission = await db.insert(kpiSubmissions).values({
      id: uuidv7(),
      organizationId: membership.organizationId,
      periodYear,
      revenueGrowth,
      grossMargin,
      netMargin,
    }).returning();

    return reply.status(201).send({ data: submission[0] });
  });

  app.get("/api/v1/kpi-submissions", async (request, reply) => {
    const session = await app.auth.api.getSession({
      headers: fromNodeHeaders(request.headers),
    });
    if (!session?.user) {
      return reply.status(401).send({ error: { code: "UNAUTHORIZED", message: "Not authenticated" } });
    }

    const membership = await db.query.organizationMembers.findFirst({
      where: (m, { eq }) => eq(m.userId, session.user.id),
    });
    if (!membership) {
      return reply.status(200).send({ data: [] });
    }

    const submissions = await db.query.kpiSubmissions.findMany({
      where: (k, { eq }) => eq(k.organizationId, membership.organizationId),
      orderBy: (k, { desc }) => desc(k.periodYear),
    });

    return reply.send({ data: submissions });
  });

  app.put("/api/v1/kpi-submissions/:year", async (request, reply) => {
    const session = await app.auth.api.getSession({
      headers: fromNodeHeaders(request.headers),
    });
    if (!session?.user) {
      return reply.status(401).send({ error: { code: "UNAUTHORIZED", message: "Not authenticated" } });
    }

    const result = submitKpiSchema.safeParse(request.body);
    if (!result.success) {
      return reply.status(400).send({ error: { code: "VALIDATION_ERROR", message: result.error.flatten() } });
    }

    const membership = await db.query.organizationMembers.findFirst({
      where: (m, { eq }) => eq(m.userId, session.user.id),
    });
    if (!membership) {
      return reply.status(403).send({ error: { code: "NO_ORG", message: "User has no organization" } });
    }

    const { year } = request.params as { year: string };
    const yearInt = parseInt(year, 10);
    if (isNaN(yearInt)) {
      return reply.status(400).send({ error: { code: "INVALID_YEAR", message: "Year must be a valid number" } });
    }

    const updated = await db.update(kpiSubmissions)
      .set({ revenueGrowth: result.data.revenueGrowth, grossMargin: result.data.grossMargin, netMargin: result.data.netMargin })
      .where(and(eq(kpiSubmissions.organizationId, membership.organizationId), eq(kpiSubmissions.periodYear, yearInt)))
      .returning();

    if (!updated.length) {
      return reply.status(404).send({ error: { code: "NOT_FOUND", message: "Submission not found" } });
    }

    return reply.send({ data: updated[0] });
  });
}
