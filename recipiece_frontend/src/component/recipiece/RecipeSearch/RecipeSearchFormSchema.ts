import { Constant } from "@recipiece/constant";
import { z } from "zod";

export const RecipeSearchFormSchema = z.object({
  currentIngredientTerm: z.string(),
  ingredients: z.array(z.object({ name: z.string() })),
  currentTagTerm: z.string(),
  tags: z.array(z.object({ content: z.string() })),
  search: z.string(),
  currentMembershipTerm: z.string(),
  userKitchenMembershipIds: z.array(z.string()),
  showAllRecipes: z.boolean(),
});

export type RecipeSearchForm = z.infer<typeof RecipeSearchFormSchema>;

export const DefaultRecipeSearchFormValues: RecipeSearchForm = {
  currentIngredientTerm: "",
  ingredients: [],
  currentTagTerm: "",
  currentMembershipTerm: "",
  tags: [],
  search: "",
  userKitchenMembershipIds: [Constant.USER_KITCHEN_MEMBERSHIP_IDS_ALL],
  showAllRecipes: true,
};
