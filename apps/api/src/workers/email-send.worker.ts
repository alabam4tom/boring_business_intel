import type PgBoss from "pg-boss";
import type { FastifyBaseLogger } from "fastify";
import { sendEmail, type EmailSendPayload } from "../services/email.js";

export async function emailSendWorker(jobs: PgBoss.Job<EmailSendPayload>[]): Promise<void> {
  for (const job of jobs) {
    try {
      await sendEmail(console as unknown as FastifyBaseLogger, job.data);
    } catch (err) {
      console.error({ jobId: job.id, to: job.data.to, err }, "[email-send] job failed");
      throw err;
    }
  }
}
