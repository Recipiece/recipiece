import { date, InferType, number, object, string } from "yup";
import { generateYListQueryResponseSchema, YListQuerySchema } from "./list";

export const YNotificationSchema = object({
  id: number().required(),
  created_at: date().required(),
  user_id: number().required(),
  status: string().oneOf(["read", "unread"]).required(),
  content: string().required(),
  read_at: date().nullable(),
  read_by_user_id: number().nullable(),
  type: string().required(),
  title: string().required(),
})
  .strict()
  .noUnknown();

export interface NotificationSchema extends InferType<typeof YNotificationSchema> {}

/**
 * List notifications
 */
export const YListNotificationsQuerySchema = YListQuerySchema.strict().noUnknown();

export interface ListNotificationsQuerySchema extends InferType<typeof YListNotificationsQuerySchema> {}

export const YListNotificationsResponseSchema = generateYListQueryResponseSchema(YNotificationSchema);

export interface ListNotificationsResponseSchema extends InferType<typeof YListNotificationsResponseSchema> {}

/**
 * Set notification status
 */
export const YSetNotificationStatusRequestSchema = object({
  id: number().required(),
  status: string().oneOf(["read", "unread"]).required(),
})
  .strict()
  .noUnknown();

export interface SetNotificationStatusRequestSchema extends InferType<typeof YSetNotificationStatusRequestSchema> {}
