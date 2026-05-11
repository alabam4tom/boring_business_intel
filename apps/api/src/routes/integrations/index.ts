import type { FastifyInstance } from "fastify";
import { integrationHandlers } from "./handlers.js";

export async function integrationRoutes(app: FastifyInstance) {
  await integrationHandlers(app);
}
