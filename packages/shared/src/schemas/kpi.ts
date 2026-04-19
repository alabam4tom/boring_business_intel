import { z } from "zod";

const currentYear = new Date().getFullYear();

export const submitKpiSchema = z.object({
  periodYear: z.number().int().min(2020).max(currentYear),
  revenueGrowth: z.number().min(-100).max(10000).nullable(),
  grossMargin: z.number().min(-100).max(100).nullable(),
  netMargin: z.number().min(-100).max(100).nullable(),
}).refine(
  (d) => d.revenueGrowth !== null || d.grossMargin !== null || d.netMargin !== null,
  { message: "At least one metric is required" },
);

export type SubmitKpiInput = z.infer<typeof submitKpiSchema>;
