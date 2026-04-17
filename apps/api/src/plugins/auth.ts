import fp from "fastify-plugin";
import { fromNodeHeaders } from "better-auth/node";
import type { FastifyInstance } from "fastify";
import { createAuth, type Auth } from "../lib/auth.js";

declare module "fastify" {
  interface FastifyInstance {
    auth: Auth;
  }
}

async function authPlugin(fastify: FastifyInstance) {
  const auth = createAuth(fastify.log);
  fastify.decorate("auth", auth);

  fastify.route({
    method: ["GET", "POST"],
    url: "/api/auth/*",
    async handler(request, reply) {
      const url = new URL(request.url, `http://${request.headers.host}`);
      const headers = fromNodeHeaders(request.headers);
      const body =
        request.method !== "GET" && request.body
          ? JSON.stringify(request.body)
          : undefined;

      const req = new Request(url.toString(), {
        method: request.method,
        headers,
        body,
      });

      const response = await auth.handler(req);
      reply.status(response.status);
      response.headers.forEach((value, key) => reply.header(key, value));
      reply.send(response.body ? await response.text() : null);
    },
  });
}

export default fp(authPlugin, { name: "auth" });
