import { generateCookbook, generateRecipe, generateRecipeCookbookAttachment, generateUser } from "@recipiece/test";

export const generateCookbookWithRecipe = async (userId?: number) => {
  const trueUserId = userId ?? (await generateUser()).id;
  const cookbook = await generateCookbook({ user_id: trueUserId });
  const recipe = await generateRecipe({ user_id: trueUserId });
  await generateRecipeCookbookAttachment({
    recipe_id: recipe.id,
    cookbook_id: cookbook.id,
  });

  return [cookbook, recipe];
};
