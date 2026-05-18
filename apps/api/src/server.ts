import Fastify from "fastify";
import cors from "@fastify/cors";
import rawBody from "fastify-raw-body";
import authPlugin from "./plugins/auth.js";
import { organizationRoutes } from "./routes/organizations.js";
import { kpiRoutes } from "./routes/kpi.js";
import { benchmarkRoutes } from "./routes/benchmarks.js";
import { billingRoutes } from "./routes/billing.js";
import { integrationRoutes } from "./routes/integrations/index.js";
import { codatWebhookRoutes } from "./routes/webhooks/codat.js";
import { dataQualityRoutes } from "./routes/data-quality.js";
import { membersRoutes } from "./routes/members.js";
import { privacyRoutes } from "./routes/privacy.js";
import { adminRoutes } from "./routes/admin.js";
import { initWorkers } from "./workers/index.js";

const fastify = Fastify({
  logger: {
    level: process.env.LOG_LEVEL ?? "info",
  },
});

await fastify.register(cors, {
  origin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
  credentials: true,
});

await fastify.register(rawBody, { global: false, encoding: false });

await fastify.register(authPlugin);
await fastify.register(organizationRoutes);
await fastify.register(kpiRoutes);
await fastify.register(benchmarkRoutes);
await fastify.register(billingRoutes);
await fastify.register(integrationRoutes);
await fastify.register(codatWebhookRoutes);
await fastify.register(dataQualityRoutes);
await fastify.register(membersRoutes);
await fastify.register(privacyRoutes);
await fastify.register(adminRoutes);

fastify.get("/api/v1/health", async () => {
  return { status: "ok" };
});

const port = Number(process.env.PORT ?? 3001);
const host = process.env.HOST ?? "0.0.0.0";

try {
  await initWorkers();
  await fastify.listen({ port, host });
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
