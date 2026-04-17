export const SUBSCRIPTION_TIERS = ["free", "pro", "enterprise"] as const;
export type SubscriptionTier = (typeof SUBSCRIPTION_TIERS)[number];
