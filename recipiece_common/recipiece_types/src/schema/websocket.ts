import { InferType, object, string } from "yup";

export const YAuthenticatedWebsocketRequestSchema = object({
  authorization: string().notRequired(),
  route: string().required(),
});

export interface AuthenticatedWebsocketRequestSchema extends InferType<typeof YAuthenticatedWebsocketRequestSchema> {}
