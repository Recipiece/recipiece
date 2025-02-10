import { prisma } from "@recipiece/database";
import {
  generateCookbook,
  generateMealPlan,
  generateMealPlanItem,
  generateRecipe,
  generateRecipeCookbookAttachment,
  generateRecipeWithIngredientsAndSteps,
  generateShoppingList,
  generateShoppingListWithItems,
  generateUser,
  generateUserCredentials,
  generateUserKitchenMembership,
  generateUserTag,
  randomInt,
} from "@recipiece/test";
import argon2 from "argon2";
import { DateTime } from "luxon";

const hashPassword = async (plainPassword: string) => {
  try {
    const hash = await argon2.hash(plainPassword, {
      type: argon2.argon2id, // Argon2id variant is the most secure
      memoryCost: 2 ** 16, // Memory cost parameter (e.g., 64 MB)
      timeCost: 5, // Time cost (e.g., 5 iterations)
      parallelism: 1, // Parallelism factor (e.g., single-threaded)
    });
    return hash;
  } catch (err) {
    console.error(err);
    return undefined;
  }
};

const deleteExistingUsers = async () => {
  await prisma.user.deleteMany();
};

const seedDevUser = async () => {
  const user = await generateUser({
    username: "dev29",
    email: "dev@recipiece.org",
    validated: true,
    preferences: {
      account_visibility: "protected",
    },
  });
  await generateUserCredentials({
    user_id: user.id,
    password_hash: (await hashPassword("password"))!,
  });

  const gennedRecipes = [];
  for (let i = 0; i < 120; i++) {
    const recipe = await generateRecipeWithIngredientsAndSteps({
      user_id: user.id,
    });
    gennedRecipes.push(recipe);
  }

  for (let i = 0; i < 13; i++) {
    const cookbook = await generateCookbook({
      user_id: user.id,
    });
    if (i % 2 === 0) {
      const numRecipesToAdd = Math.floor(Math.random() * gennedRecipes.length);
      for (let j = 0; j < numRecipesToAdd; j++) {
        await generateRecipeCookbookAttachment({
          recipe_id: gennedRecipes[j].id,
          cookbook_id: cookbook.id,
        });
      }
    }
  }

  for (let i = 0; i < 3; i++) {
    await generateShoppingListWithItems({
      user_id: user.id,
    });
  }

  const mealPlanCreatedAt = DateTime.utc().minus({ days: 20 });
  const endDate = DateTime.utc().plus({ days: 20 });
  const hoursBetween = endDate.diff(mealPlanCreatedAt, "hours").hours;

  const mealPlan = await generateMealPlan({
    user_id: user.id,
    created_at: mealPlanCreatedAt.toJSDate(),
  });

  for (let i = 0; i < Math.ceil(hoursBetween); i += 8) {
    if (i % 2 === 0) {
      await generateMealPlanItem({
        meal_plan_id: mealPlan.id,
        start_date: mealPlanCreatedAt.plus({ hours: i }).toJSDate(),
        recipe_id: gennedRecipes[Math.floor(Math.random() * gennedRecipes.length)].id,
      });
    } else {
      await generateMealPlanItem({
        meal_plan_id: mealPlan.id,
        start_date: mealPlanCreatedAt.plus({ hours: i }).toJSDate(),
        freeform_content: "hello world goodbye mars",
      });
    }
  }

  for (let i = 0; i < randomInt({ min: 5, max: 20 }); i++) {
    await generateUserTag({ user_id: user.id });
  }

  return user;
};

const seedEmptyUser = async () => {
  const user = await generateUser({
    username: "empty29",
    email: "empty@recipiece.org",
    validated: false,
    preferences: {
      account_visibility: "protected",
    },
  });
  await generateUserCredentials({
    user_id: user.id,
    password_hash: (await hashPassword("password"))!,
  });

  return user;
};

const seedOtherUser = async () => {
  const user = await generateUser({
    username: "other29",
    email: "other@recipiece.org",
    validated: true,
    preferences: {
      account_visibility: "protected",
    },
  });
  await generateUserCredentials({
    user_id: user.id,
    password_hash: (await hashPassword("password"))!,
  });

  await generateRecipe({
    user_id: user.id,
  });
  await generateCookbook({
    user_id: user.id,
  });
  await generateShoppingList({
    user_id: user.id,
  });

  return user;
};

(async () => {
  await deleteExistingUsers();

  const devUser = await seedDevUser();
  const emptyUser = await seedEmptyUser();
  const otherUser = await seedOtherUser();

  await generateUserKitchenMembership({
    source_user_id: devUser.id,
    destination_user_id: otherUser.id,
    status: "accepted",
  });

  await generateUserKitchenMembership({
    source_user_id: otherUser.id,
    destination_user_id: devUser.id,
    status: "accepted",
  });

  await generateUserKitchenMembership({
    source_user_id: devUser.id,
    destination_user_id: emptyUser.id,
    status: "pending",
  });

  await generateUserKitchenMembership({
    source_user_id: otherUser.id,
    destination_user_id: emptyUser.id,
    status: "denied",
  });
})()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
