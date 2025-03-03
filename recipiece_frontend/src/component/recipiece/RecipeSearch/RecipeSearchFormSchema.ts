import { z } from "zod";

export const RecipeSearchFormSchema = z.object({
  currentIngredientTerm: z.string(),
  ingredients: z.array(z.object({ name: z.string() })),
  currentTagTerm: z.string(),
  tags: z.array(z.object({ content: z.string() })),
  search: z.string(),
  shared_recipes_filter: z.boolean(),
});

export type RecipeSearchForm = z.infer<typeof RecipeSearchFormSchema>;

export const DefaultRecipeSearchFormValues: RecipeSearchForm = {
  currentIngredientTerm: "",
  ingredients: [],
  currentTagTerm: "",
  tags: [],
  search: "",
  shared_recipes_filter: true,
};
