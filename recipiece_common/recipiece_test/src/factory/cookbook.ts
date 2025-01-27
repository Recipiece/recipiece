import { faker } from "@faker-js/faker";
import { Cookbook, prisma, RecipeCookbookAttachment } from "@recipiece/database";
import { generateRecipe } from "./recipe";
import { generateUser } from "./user";

export const generateRecipeCookbookAttachment = async (attachment?: Partial<RecipeCookbookAttachment>) => {
  const recipeId = attachment?.recipe_id ?? (await generateRecipe()).id;
  const cookbookId = attachment?.cookbook_id ?? (await generateCookbook()).id;

  return prisma.recipeCookbookAttachment.create({
    data: {
      recipe_id: recipeId,
      cookbook_id: cookbookId,
    },
  });
};

export const generateCookbook = async (cookbook?: Partial<Omit<Cookbook, "id">>) => {
  const userId = cookbook?.user_id ?? (await generateUser()).id;

  return prisma.cookbook.create({
    data: {
      name: cookbook?.name ?? faker.book.title(),
      user_id: userId,
      description: cookbook?.description ?? faker.word.words({ count: { min: 2, max: 15 } }),
      created_at: cookbook?.created_at ?? new Date(),
    },
  });
};
