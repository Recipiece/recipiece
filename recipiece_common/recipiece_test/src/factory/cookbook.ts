import { faker } from "@faker-js/faker";
import { Cookbook, CookbookShare, prisma, PrismaTransaction, RecipeCookbookAttachment, UserKitchenMembership } from "@recipiece/database";
import { generateRecipe } from "./recipe";
import { generateUser, generateUserKitchenMembership } from "./user";
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

export const generateCookbookShare = async (share?: Partial<Omit<CookbookShare, "id">>, tx?: PrismaTransaction): Promise<CookbookShare> => {
  let userKitchenMembership: UserKitchenMembership | undefined = undefined;
  if (share?.user_kitchen_membership_id) {
    userKitchenMembership =
      (await (tx ?? prisma).userKitchenMembership.findFirst({
        where: {
          id: share.user_kitchen_membership_id,
        },
      })) ?? undefined;
  }

  if (!userKitchenMembership) {
    userKitchenMembership = await generateUserKitchenMembership(undefined, tx);
  }

  const cookbookId =
    share?.cookbook_id ??
    (
      await generateCookbook(
        {
          user_id: userKitchenMembership.source_user_id,
        },
        tx
      )
    ).id;

  return (tx ?? prisma).cookbookShare.create({
    data: {
      user_kitchen_membership_id: userKitchenMembership.id,
      cookbook_id: cookbookId,
    },
  });
};
