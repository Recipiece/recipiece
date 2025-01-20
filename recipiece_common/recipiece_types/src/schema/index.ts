import { InferType, object } from "yup";
import "./extensions";

export * from "./convert";
export * from "./cookbook";
export * from "./knownIngredient";
export * from "./mealPlan";
export * from "./recipe";
export * from "./shoppingList";
export * from "./timer";
export * from "./user";
export * from "./websocket";

export const YEmptySchema = object({}).strict().noUnknown();

export interface EmptySchema extends InferType<typeof YEmptySchema> {}
