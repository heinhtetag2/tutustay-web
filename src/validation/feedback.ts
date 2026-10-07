import { z } from "zod";

/** Usability-test feedback. The tasks match docs/06-usability-test-kit.md. */
export const FEEDBACK_TASKS = ["search", "stay", "booking", "coupons", "mybookings", "account", "help", "other"] as const;
export const FEEDBACK_KINDS = ["problem", "confusing", "idea", "praise"] as const;
export const FEEDBACK_TEAMS = ["support", "ops", "sales", "tech", "other"] as const;

export const feedbackSchema = z.object({
  task: z.enum(FEEDBACK_TASKS),
  kind: z.enum(FEEDBACK_KINDS),
  ease: z.number().int().min(1).max(5),
  message: z.string().trim().min(3).max(2000),
  name: z.string().trim().max(80).optional(),
  team: z.enum(FEEDBACK_TEAMS).optional(),
  page: z.string().max(300),
  locale: z.string().max(5),
  device: z.enum(["mobile", "desktop"]),
  viewport: z.string().max(20),
});

export type FeedbackInput = z.infer<typeof feedbackSchema>;
export interface FeedbackRecord extends FeedbackInput { id: string; createdAt: string; userAgent: string }
