import type { FastifyInstance } from "fastify";
import { fromNodeHeaders } from "better-auth/node";
import { db } from "@repo/db";
import { organizations } from "@repo/db/schema";
import { eq } from "drizzle-orm";
import { createHmac, timingSafeEqual } from "crypto";

const LS_API = "https://api.lemonsqueezy.com/v1";

export async function billingRoutes(app: FastifyInstance) {
  // Create a checkout session and return the URL
  app.post("/api/v1/billing/checkout", async (request, reply) => {
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
      return reply.status(404).send({ error: { code: "NO_ORG", message: "No organization found" } });
    }

    const apiKey = process.env.LEMONSQUEEZY_API_KEY;
    const variantId = process.env.LEMONSQUEEZY_VARIANT_ID;
    const storeId = process.env.LEMONSQUEEZY_STORE_ID;

    if (!apiKey || !variantId || !storeId) {
      return reply.status(503).send({ error: { code: "BILLING_NOT_CONFIGURED", message: "Billing not configured" } });
    }

    const appUrl = process.env.APP_URL ?? "http://localhost:3000";

    const res = await fetch(`${LS_API}/checkouts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/vnd.api+json",
        Accept: "application/vnd.api+json",
      },
      body: JSON.stringify({
        data: {
          type: "checkouts",
          attributes: {
            checkout_data: {
              email: session.user.email,
              custom: { organization_id: membership.organizationId },
            },
            product_options: {
              redirect_url: `${appUrl}/dashboard?upgraded=1`,
            },
          },
          relationships: {
            store: { data: { type: "stores", id: storeId } },
            variant: { data: { type: "variants", id: variantId } },
          },
        },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      app.log.error({ err }, "LemonSqueezy checkout failed");
      return reply.status(502).send({ error: { code: "CHECKOUT_FAILED", message: "Could not create checkout" } });
    }

    const data = await res.json() as { data: { attributes: { url: string } } };
    return reply.send({ url: data.data.attributes.url });
  });

  // LemonSqueezy webhook — verify signature then update subscription
  app.post("/api/v1/billing/webhook", {
    config: { rawBody: true },
  }, async (request, reply) => {
    const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
    if (!secret) {
      return reply.status(503).send({ error: "Webhook secret not configured" });
    }

    const signature = request.headers["x-signature"] as string;
    if (!signature) {
      return reply.status(400).send({ error: "Missing signature" });
    }

    const rawBody = (request as unknown as { rawBody: Buffer }).rawBody;
    const expected = createHmac("sha256", secret).update(rawBody).digest("hex");

    try {
      if (!timingSafeEqual(Buffer.from(signature, "hex"), Buffer.from(expected, "hex"))) {
        return reply.status(401).send({ error: "Invalid signature" });
      }
    } catch {
      return reply.status(401).send({ error: "Invalid signature" });
    }

    const event = request.body as {
      meta: { event_name: string; custom_data?: { organization_id?: string } };
      data: { attributes: { customer_id: number; status: string; first_subscription_item?: unknown } };
    };

    const eventName = event.meta.event_name;
    const orgId = event.meta.custom_data?.organization_id;
    const lsCustomerId = String(event.data.attributes.customer_id);
    const status = event.data.attributes.status;

    if (!orgId) {
      return reply.status(200).send({ ok: true });
    }

    if (eventName === "subscription_created" || (eventName === "subscription_updated" && status === "active")) {
      await db.update(organizations)
        .set({ subscriptionTier: "pro", lsCustomerId, updatedAt: new Date() })
        .where(eq(organizations.id, orgId));
    } else if (
      eventName === "subscription_cancelled" ||
      (eventName === "subscription_updated" && ["cancelled", "expired", "past_due"].includes(status))
    ) {
      await db.update(organizations)
        .set({ subscriptionTier: "free", updatedAt: new Date() })
        .where(eq(organizations.id, orgId));
    }

    return reply.send({ ok: true });
  });
}
