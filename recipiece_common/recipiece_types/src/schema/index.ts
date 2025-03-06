import { InferType, object, string } from "yup";

export * from "./convert";
export * from "./cookbook";
export * from "./knownIngredient";
export * from "./mealPlan";
export * from "./recipe";
export * from "./shoppingList";
export * from "./sideJob";
export * from "./user";
export * from "./websocket";
export * from "./list";
export * from "./notification";

export const YEmptySchema = object({}).noUnknown();

export interface EmptySchema extends InferType<typeof YEmptySchema> {}

export const YErrorSchema = object({
  message: string().notRequired(),
}).noUnknown();

export interface ErrorSchema extends InferType<typeof YErrorSchema> {}
