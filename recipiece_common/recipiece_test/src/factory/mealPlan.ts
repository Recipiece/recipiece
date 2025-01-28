import { faker } from "@faker-js/faker";
import { MealPlan, MealPlanItem, MealPlanShare, prisma, UserKitchenMembership } from "@recipiece/database";
import { generateRecipe } from "./recipe";
import { generateUser, generateUserKitchenMembership } from "./user";

export const generateMealPlanShare = async (share?: Partial<Omit<MealPlanShare, "id">>): Promise<MealPlanShare> => {
  let userKitchenMembership: UserKitchenMembership | undefined = undefined;
  if (share?.user_kitchen_membership_id) {
    userKitchenMembership =
      (await prisma.userKitchenMembership.findFirst({
        where: {
          id: share.user_kitchen_membership_id,
        },
      })) ?? undefined;
  }

  if (!userKitchenMembership) {
    userKitchenMembership = await generateUserKitchenMembership();
  }

  const mealPlanId =
    share?.meal_plan_id ??
    (
      await generateMealPlan({
        user_id: userKitchenMembership.source_user_id,
      })
    ).id;

  return prisma.mealPlanShare.create({
    data: {
      user_kitchen_membership_id: userKitchenMembership.id,
      meal_plan_id: mealPlanId,
    },
  });
};

export const generateMealPlanItem = async (mealPlanItem?: Partial<Omit<MealPlanItem, "id">>): Promise<MealPlanItem> => {
  let mealPlan: MealPlan | undefined = undefined;
  if (mealPlanItem?.meal_plan_id) {
    mealPlan =
      (await prisma.mealPlan.findFirst({
        where: {
          id: mealPlanItem.meal_plan_id!,
        },
      })) ?? undefined;
  }

  if (!mealPlan) {
    mealPlan = await generateMealPlan();
  }

  let freeformContent = mealPlanItem?.freeform_content;
  let recipeId = undefined;

  if (!mealPlanItem?.freeform_content) {
    const shouldGenRecipe = faker.number.int({ min: 0, max: 1 }) % 2 === 0;
    if (shouldGenRecipe) {
      recipeId = (await generateRecipe({ user_id: mealPlan.user_id })).id;
    } else {
      freeformContent = faker.word.words({ count: { min: 3, max: 15 } });
    }
  }

  return await prisma.mealPlanItem.create({
    data: {
      meal_plan_id: mealPlan.id,
      created_at: mealPlanItem?.created_at ?? new Date(),
      start_date: mealPlanItem?.start_date ?? new Date(),
      freeform_content: freeformContent,
      recipe_id: recipeId,
      notes: mealPlanItem?.notes ?? faker.word.words({ count: { min: 0, max: 5 } }),
    },
  });
};

export const generateMealPlan = async (mealPlan?: Partial<Omit<MealPlan, "id">>): Promise<MealPlan> => {
  const userId = mealPlan?.user_id ?? (await generateUser()).id;
  return await prisma.mealPlan.create({
    data: {
      user_id: userId,
      name: mealPlan?.name ?? faker.commerce.department(),
      created_at: mealPlan?.created_at ?? new Date(),
      configuration: mealPlan?.configuration ?? {},
    },
  });
};
