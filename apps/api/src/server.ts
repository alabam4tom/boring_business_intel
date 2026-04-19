import Fastify from "fastify";
import cors from "@fastify/cors";
import authPlugin from "./plugins/auth.js";
import { organizationRoutes } from "./routes/organizations.js";
import { kpiRoutes } from "./routes/kpi.js";

const fastify = Fastify({
  logger: {
    level: process.env.LOG_LEVEL ?? "info",
  },
});

await fastify.register(cors, {
  origin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
  credentials: true,
});

await fastify.register(authPlugin);
await fastify.register(organizationRoutes);
await fastify.register(kpiRoutes);

fastify.get("/api/v1/health", async () => {
  return { status: "ok" };
});

const port = Number(process.env.PORT ?? 3001);
const host = process.env.HOST ?? "0.0.0.0";

try {
  await fastify.listen({ port, host });
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
