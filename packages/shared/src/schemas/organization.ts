import { z } from "zod";

export const createOrganizationSchema = z.object({
  name: z.string().min(2).max(100),
  agencySize: z.enum(["micro", "small", "mid", "large"]),
  region: z.enum(["north_america", "europe", "apac", "latam", "middle_east_africa"]),
  serviceType: z.enum([
    "full_service",
    "creative_branding",
    "digital_marketing",
    "web_development",
    "pr_communications",
    "content_production",
  ]),
});

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;
