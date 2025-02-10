import { InferType, object } from "yup";

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

export const YEmptySchema = object({}).strict().noUnknown();

export interface EmptySchema extends InferType<typeof YEmptySchema> {}
