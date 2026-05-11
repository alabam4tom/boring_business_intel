import { z } from "zod";

const consentSchema = z.object({
  consentAccepted: z.literal(true, { message: "Consent must be accepted to proceed" }),
});

export const connectQuickBooksSchema = consentSchema;
export const connectXeroSchema = consentSchema;

export type ConnectQuickBooksInput = z.infer<typeof connectQuickBooksSchema>;
export type ConnectXeroInput = z.infer<typeof connectXeroSchema>;
