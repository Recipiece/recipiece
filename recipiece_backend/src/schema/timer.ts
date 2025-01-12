import { date, InferType, number, object } from "yup";
import { generateYListQuerySchema, YListQuerySchema } from "./list";

export const YTimerSchema = object({
  id: number().required(),
  created_at: date().required(),
  duration_ms: number().required(),
})
  .strict()
  .noUnknown();

export interface TimerSchema extends InferType<typeof YTimerSchema> {}

/**
 * Create timer
 */
export const YCreateTimerRequestSchema = object({
  duration_ms: number()
    .required()
    .min(1000, "Timer cannot be shorter than 1 second"),
})
  .strict()
  .noUnknown();

export interface CreateTimerRequestSchema extends InferType<typeof YCreateTimerRequestSchema> {}

/**
 * Update Timer
 */
export const YUpdateTimerRequestSchema = object({
  id: number().required(),
  duration_ms: number()
    .notRequired()
    .min(1000, "Timer cannot be shorter than 1 second"),
})
  .strict()
  .noUnknown();

export interface UpdateTimerRequestSchema extends InferType<typeof YUpdateTimerRequestSchema> {}

/**
 * List timers
 */
export const YListTimersQuerySchema = YListQuerySchema.shape({
  user_id: number().notRequired(),
})
  .strict()
  .noUnknown();

export interface ListTimersQuerySchema extends InferType<typeof YListTimersQuerySchema> {}

export const YListTimersResponseSchema = generateYListQuerySchema(YTimerSchema);

export interface ListTimersResponseSchema extends InferType<typeof YListTimersResponseSchema> {}
