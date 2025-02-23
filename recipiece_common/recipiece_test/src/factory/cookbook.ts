import { faker } from "@faker-js/faker";
import { Cookbook, prisma, PrismaTransaction, RecipeCookbookAttachment } from "@recipiece/database";
import { generateRecipe } from "./recipe";
import { generateUser } from "./user";
import { cookbookNameGenerator } from "../generator";

export const generateRecipeCookbookAttachment = async (attachment?: Partial<RecipeCookbookAttachment>, tx?: PrismaTransaction) => {
  const recipeId = attachment?.recipe_id ?? (await generateRecipe(undefined, tx)).id;
  const cookbookId = attachment?.cookbook_id ?? (await generateCookbook(undefined, tx)).id;

  return (tx ?? prisma).recipeCookbookAttachment.create({
    data: {
      recipe_id: recipeId,
      cookbook_id: cookbookId,
    },
  });
};

export const generateCookbook = async (cookbook?: Partial<Omit<Cookbook, "id">>, tx?: PrismaTransaction) => {
  const userId = cookbook?.user_id ?? (await generateUser(undefined, tx)).id;

  return (tx ?? prisma).cookbook.create({
    data: {
      name: cookbook?.name ?? cookbookNameGenerator.next().value,
      user_id: userId,
      description: cookbook?.description ?? faker.word.words({ count: { min: 2, max: 15 } }),
      created_at: cookbook?.created_at ?? new Date(),
    },
  });
};
