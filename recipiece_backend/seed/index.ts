import { DeleteObjectsCommand, ListObjectsV2Command, S3Client } from "@aws-sdk/client-s3";
import { faker } from "@faker-js/faker";
import { prisma } from "@recipiece/database";
import {
  generateCookbook,
  generateHashedPassword,
  generateMealPlan,
  generateMealPlanItem,
  generateRecipe,
  generateRecipeCookbookAttachment,
  generateRecipeImage,
  generateRecipeWithIngredientsAndSteps,
  generateShoppingList,
  generateShoppingListWithItems,
  generateUser,
  generateUserCredentials,
  generateUserKitchenMembership,
  generateUserTag,
} from "@recipiece/test";
import { DateTime } from "luxon";

const deleteExistingUsers = async () => {
  await prisma.user.deleteMany();

  try {
    const s3 = new S3Client({
      endpoint: process.env.APP_S3_ENDPOINT!,
      credentials: {
        accessKeyId: process.env.APP_S3_ACCESS_KEY_ID!,
        secretAccessKey: process.env.APP_S3_SECRET_KEY!,
      },
    });

    const listObjectsCommand = new ListObjectsV2Command({
      Bucket: process.env.APP_S3_BUCKET,
    });

    const listObjectsResponse = await s3.send(listObjectsCommand);
    const keys = (listObjectsResponse.Contents ?? []).map((obj) => {
      return obj.Key;
    });

    if (keys.length > 0) {
      const deleteObjectsCommand = new DeleteObjectsCommand({
        Bucket: process.env.APP_S3_BUCKET,
        Delete: {
          Objects: keys.map((k) => {
            return { Key: k };
          }),
        },
      });
      await s3.send(deleteObjectsCommand);
    }
  } catch (err) {
    console.error(err);
  }
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
    password_hash: (await generateHashedPassword("password"))!,
  });

  const gennedRecipes = [];
  for (let i = 0; i < 120; i++) {
    let recipe = await generateRecipeWithIngredientsAndSteps({
      user_id: user.id,
    });
    if (i % 2 === 0) {
      recipe = await generateRecipeImage(recipe);
    }
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

  const numTags = faker.number.int({ min: 5, max: 20 });
  const tagContents = faker.helpers.uniqueArray(faker.word.words, numTags);
  for (let i = 0; i < numTags; i++) {
    await generateUserTag({ user_id: user.id, content: tagContents.pop() });
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
    password_hash: (await generateHashedPassword("password"))!,
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
    password_hash: (await generateHashedPassword("password"))!,
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
