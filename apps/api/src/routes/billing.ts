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

  // Get current billing status
  app.get("/api/v1/billing", async (request, reply) => {
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

    const org = await db.query.organizations.findFirst({
      where: (o, { eq }) => eq(o.id, membership.organizationId),
    });
    if (!org) {
      return reply.status(404).send({ error: { code: "ORG_NOT_FOUND", message: "Organization not found" } });
    }

    return reply.send({
      data: {
        tier: org.subscriptionTier,
        subscriptionStatus: org.lsSubscriptionStatus,
        currentPeriodEnd: org.lsCurrentPeriodEnd?.toISOString() ?? null,
        hasSubscription: org.lsSubscriptionId !== null,
      },
    });
  });

  // Get LemonSqueezy customer portal URL
  app.post("/api/v1/billing/portal", async (request, reply) => {
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

    const org = await db.query.organizations.findFirst({
      where: (o, { eq }) => eq(o.id, membership.organizationId),
    });
    if (!org?.lsCustomerId) {
      return reply.status(404).send({ error: { code: "NOT_SUBSCRIBED", message: "No active subscription" } });
    }

    const apiKey = process.env.LEMONSQUEEZY_API_KEY;
    if (!apiKey) {
      return reply.status(503).send({ error: { code: "BILLING_NOT_CONFIGURED", message: "Billing not configured" } });
    }

    const res = await fetch(`${LS_API}/customers/${org.lsCustomerId}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/vnd.api+json",
      },
    });

    if (!res.ok) {
      app.log.error({ lsCustomerId: org.lsCustomerId }, "LemonSqueezy customer fetch failed");
      return reply.status(502).send({ error: { code: "PORTAL_FETCH_FAILED", message: "Could not load billing portal" } });
    }

    const body = await res.json() as { data: { attributes: { urls: { customer_portal: string } } } };
    const portalUrl = body.data.attributes.urls.customer_portal;

    return reply.send({ data: { portalUrl } });
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
      data: {
        id: string;
        attributes: {
          customer_id: number;
          status: string;
          renews_at: string | null;
          ends_at: string | null;
        };
      };
    };

    const eventName = event.meta.event_name;
    const orgId = event.meta.custom_data?.organization_id;
    const lsCustomerId = String(event.data.attributes.customer_id);
    const lsSubscriptionId = event.data.id;
    const status = event.data.attributes.status;
    const renewsAt = event.data.attributes.renews_at ? new Date(event.data.attributes.renews_at) : null;
    const endsAt = event.data.attributes.ends_at ? new Date(event.data.attributes.ends_at) : null;

    if (!orgId) {
      return reply.status(200).send({ ok: true });
    }

    if (eventName === "subscription_created" || (eventName === "subscription_updated" && status === "active")) {
      await db.update(organizations)
        .set({
          subscriptionTier: "pro",
          lsCustomerId,
          lsSubscriptionId,
          lsSubscriptionStatus: "active",
          lsCurrentPeriodEnd: renewsAt,
          updatedAt: new Date(),
        })
        .where(eq(organizations.id, orgId));
      app.log.info({ orgId, eventName }, "Subscription activated");
    } else if (eventName === "subscription_cancelled" || (eventName === "subscription_updated" && status === "cancelled")) {
      // Keep tier=pro — access remains until ends_at
      await db.update(organizations)
        .set({
          lsSubscriptionStatus: "cancelled",
          lsCurrentPeriodEnd: endsAt,
          updatedAt: new Date(),
        })
        .where(eq(organizations.id, orgId));
      app.log.info({ orgId, eventName, endsAt }, "Subscription cancellation scheduled");
    } else if (eventName === "subscription_expired" || (eventName === "subscription_updated" && status === "expired")) {
      // Billing period ended — downgrade to free
      await db.update(organizations)
        .set({
          subscriptionTier: "free",
          lsSubscriptionStatus: null,
          lsCurrentPeriodEnd: null,
          updatedAt: new Date(),
        })
        .where(eq(organizations.id, orgId));
      app.log.info({ orgId, eventName }, "Subscription expired — downgraded to free");
    }

    return reply.send({ ok: true });
  });
}
