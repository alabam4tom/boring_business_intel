import type { FastifyInstance } from "fastify";
import { fromNodeHeaders } from "better-auth/node";
import { db } from "@repo/db";

const LOW_QUALITY_THRESHOLD = 80;

export async function dataQualityRoutes(app: FastifyInstance) {
  app.get("/api/v1/data-quality", async (request, reply) => {
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
      return reply.send({ data: null });
    }

    const dq = await db.query.dataQualityScores.findFirst({
      where: (d, { eq }) => eq(d.organizationId, membership.organizationId),
    });
    if (!dq) {
      return reply.send({ data: null });
    }

    return reply.send({
      data: {
        score: dq.score,
        issues: dq.issues,
        isLowQuality: dq.score < LOW_QUALITY_THRESHOLD,
        periodsAvailable: dq.periodsAvailable,
        computedAt: dq.computedAt.toISOString(),
      },
    });
  });
}
