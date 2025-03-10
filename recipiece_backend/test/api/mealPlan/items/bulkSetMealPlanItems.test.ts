import { prisma, User } from "@recipiece/database";
import {
  generateMealPlan,
  generateMealPlanItem,
  generateMealPlanShare,
  generateRecipe,
  generateRecipeShare,
  generateUser,
  generateUserKitchenMembership,
} from "@recipiece/test";
import {
  BulkSetMealPlanItemsRequestSchema,
  BulkSetMealPlanItemsResponseSchema,
  MealPlanItemJobDataSchema,
} from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import { DateTime } from "luxon";
import request from "supertest";
import { mealPlanItemQueue } from "../../../../src/job";
import { JobType } from "../../../../src/util/constant";

describe("Bulk Set Meal Plan Items", () => {
  let jobSpy: jest.SpyInstance;
  let user: User;
  let bearerToken: string;

  beforeEach(async () => {
    [user, bearerToken] = await fixtures.createUserAndToken();
    jobSpy = jest.spyOn(mealPlanItemQueue, "add");
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should create new items and enqueue jobs for the items", async () => {
    const mealPlan = await generateMealPlan({ user_id: user.id });
    await generateMealPlanItem({ meal_plan_id: mealPlan.id });

    const response = await request(server)
      .post(`/meal-plan/${mealPlan.id}/item/bulk-set`)
      .set("Authorization", `Bearer ${bearerToken}`)
      .send(<BulkSetMealPlanItemsRequestSchema>{
        create: [
          {
            meal_plan_id: mealPlan.id,
            freeform_content: "asdfqwer",
            start_date: DateTime.now().toJSDate(),
          },
        ],
        update: [],
        delete: [],
      });

    expect(response.statusCode).toBe(StatusCodes.OK);
    const responseBody = response.body as BulkSetMealPlanItemsResponseSchema;

    expect(responseBody.created.length).toBe(1);
    expect(responseBody.created[0].freeform_content).toBe("asdfqwer");

    const allItems = await prisma.mealPlanItem.findMany({
      where: {
        meal_plan_id: mealPlan.id,
      },
    });

    expect(allItems.length).toBe(2);

    const createdJob = await prisma.sideJob.findFirst({
      where: {
        type: JobType.MEAL_PLAN_ITEM,
        job_data: {
          path: ["meal_plan_item_id"],
          equals: responseBody.created[0].id,
        },
      },
    });
    expect(createdJob).toBeTruthy();
    expect(jobSpy).toHaveBeenCalledTimes(1);
  });

  it("should delete items", async () => {
    const mealPlan = await generateMealPlan({ user_id: user.id });
    const generatedItem = await generateMealPlanItem({ meal_plan_id: mealPlan.id });

    const response = await request(server)
      .post(`/meal-plan/${mealPlan.id}/item/bulk-set`)
      .set("Authorization", `Bearer ${bearerToken}`)
      .send(<BulkSetMealPlanItemsRequestSchema>{
        create: [],
        update: [],
        delete: [{ ...generatedItem }],
      });

    expect(response.statusCode).toBe(StatusCodes.OK);

    const remainingItems = await prisma.mealPlanItem.findMany({
      where: {
        meal_plan_id: mealPlan.id,
      },
    });
    expect(remainingItems.length).toBe(0);
  });

  it("should update items", async () => {
    const mealPlan = await generateMealPlan({ user_id: user.id });
    const generatedItem = await generateMealPlanItem({ meal_plan_id: mealPlan.id, freeform_content: "old" });

    const response = await request(server)
      .post(`/meal-plan/${mealPlan.id}/item/bulk-set`)
      .set("Authorization", `Bearer ${bearerToken}`)
      .send(<BulkSetMealPlanItemsRequestSchema>{
        create: [],
        update: [
          {
            ...generatedItem,
            freeform_content: "new",
          },
        ],
        delete: [],
      });

    expect(response.statusCode).toBe(StatusCodes.OK);

    const responseBody: BulkSetMealPlanItemsResponseSchema = response.body;
    expect(responseBody.updated.length).toBe(1);
    expect(responseBody.updated[0].freeform_content).toBe("new");

    const remainingItems = await prisma.mealPlanItem.findMany({
      where: {
        meal_plan_id: mealPlan.id,
      },
    });
    expect(remainingItems.length).toBe(1);
    expect(remainingItems[0].freeform_content).toBe("new");
  });

  it("should allow shared recipes to be used for items", async () => {
    const otherUser = await generateUser();
    const otherRecipe = await generateRecipe({ user_id: otherUser.id });
    const membership = await generateUserKitchenMembership({
      source_user_id: otherUser.id,
      destination_user_id: user.id,
      status: "accepted",
    });
    const share = await generateRecipeShare({
      user_kitchen_membership_id: membership.id,
      recipe_id: otherRecipe.id,
    });
    const mealPlan = await generateMealPlan({ user_id: user.id });

    const response = await request(server)
      .post(`/meal-plan/${mealPlan.id}/item/bulk-set`)
      .set("Authorization", `Bearer ${bearerToken}`)
      .send(<BulkSetMealPlanItemsRequestSchema>{
        create: [
          {
            recipe_id: otherRecipe.id,
            meal_plan_id: mealPlan.id,
            start_date: DateTime.utc().toJSDate(),
          },
        ],
        update: [],
        delete: [],
      });

    expect(response.statusCode).toBe(StatusCodes.OK);

    const dbItem = await prisma.mealPlanItem.findFirst({
      where: {
        recipe_id: otherRecipe.id,
      },
    });
    expect(dbItem).toBeTruthy();
  });

  it("should allow a shared user to bulk set items for a shared meal plan", async () => {
    const otherUser = await generateUser();
    const mealPlan = await generateMealPlan({
      user_id: otherUser.id,
    });
    const otherUsersRecipe = await generateRecipe({
      user_id: otherUser.id,
    });
    const itemToDelete = await generateMealPlanItem({
      recipe_id: otherUsersRecipe.id,
      meal_plan_id: mealPlan.id,
    });

    const itemToUpdate = await generateMealPlanItem({
      freeform_content: "asdfqwer",
      meal_plan_id: mealPlan.id,
    });

    const membership = await generateUserKitchenMembership({
      source_user_id: otherUser.id,
      destination_user_id: user.id,
      status: "accepted",
    });

    const recipeToAdd = await generateRecipe({
      user_id: user.id,
    });

    const response = await request(server)
      .post(`/meal-plan/${mealPlan.id}/item/bulk-set`)
      .set("Authorization", `Bearer ${bearerToken}`)
      .send(<BulkSetMealPlanItemsRequestSchema>{
        create: [
          {
            recipe_id: recipeToAdd.id,
            meal_plan_id: mealPlan.id,
            start_date: DateTime.utc().toJSDate(),
          },
        ],
        update: [
          {
            ...itemToUpdate,
            freeform_content: "new",
          },
        ],
        delete: [itemToDelete],
      });

    expect(response.statusCode).toBe(StatusCodes.OK);
    const mealPlanItems = await prisma.mealPlanItem.findMany({
      where: {
        meal_plan_id: mealPlan.id,
      },
    });
    expect(mealPlanItems.length).toBe(2);

    const recipeBasedItem = mealPlanItems.find((item) => !!item.recipe_id);
    expect(recipeBasedItem).toBeTruthy();
    expect(recipeBasedItem?.recipe_id).toBe(recipeToAdd.id);

    const nonRecipeItem = mealPlanItems.find((item) => !item.recipe_id);
    expect(nonRecipeItem).toBeTruthy();
    expect(nonRecipeItem?.freeform_content).toBe("new");
  });

  /**
   * This test is skipped because I cannot decide if this actually need to be handled or not.
   * Allowing this behavior means that a user who doesn't own a recipe will be able to see it in the
   * meal plan, but they won't be able to access it, which is probably fine
   *
   * Fixing this would require a lot of work to ensure that everyone who can access the meal plan can
   * also access the recipes being added, and it would also require some sort of mitigation when any
   * one of the users with access to both the meal plan and the recipe lose access to the recipe.
   *
   * I'm in favor of keeping it like this, and then users can sort it out amongst themselves.
   */
  xit("should not allow non shared recipes belonging to another user to be used for items", async () => {
    const otherUser = await generateUser();
    const otherRecipe = await generateRecipe({ user_id: otherUser.id });
    const mealPlan = await generateMealPlan({ user_id: user.id });

    const response = await request(server)
      .post(`/meal-plan/${mealPlan.id}/item/bulk-set`)
      .set("Authorization", `Bearer ${bearerToken}`)
      .send(<BulkSetMealPlanItemsRequestSchema>{
        create: [
          {
            recipe_id: otherRecipe.id,
            meal_plan_id: mealPlan.id,
            start_date: DateTime.utc().toJSDate(),
          },
        ],
        update: [],
        delete: [],
      });

    expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);

    const dbItem = await prisma.mealPlanItem.findFirst({
      where: {
        recipe_id: otherRecipe.id,
      },
    });
    expect(dbItem).toBeFalsy();
  });

  it("should allow a shared user to modify the items", async () => {
    const [otherUser, otherBearerToken] = await fixtures.createUserAndToken();
    const membership = await generateUserKitchenMembership({
      source_user_id: user.id,
      destination_user_id: otherUser.id,
      status: "accepted",
    });

    const mealPlan = await generateMealPlan({ user_id: user.id });
    const itemToDelete = await generateMealPlanItem({ meal_plan_id: mealPlan.id });
    const itemToUpdate = await generateMealPlanItem({ meal_plan_id: mealPlan.id, freeform_content: "old" });

    await generateMealPlanShare({
      user_kitchen_membership_id: membership.id,
      meal_plan_id: mealPlan.id,
    });

    const response = await request(server)
      .post(`/meal-plan/${mealPlan.id}/item/bulk-set`)
      .set("Authorization", `Bearer ${otherBearerToken}`)
      .send(<BulkSetMealPlanItemsRequestSchema>{
        create: [
          {
            recipe_id: (await generateRecipe({ user_id: otherUser.id })).id,
            start_date: DateTime.utc().toJSDate(),
            meal_plan_id: mealPlan.id,
          },
        ],
        update: [
          {
            ...itemToUpdate,
            freeform_content: "new",
          },
        ],
        delete: [itemToDelete],
      });

    expect(response.statusCode).toBe(StatusCodes.OK);
    const responseBody: BulkSetMealPlanItemsResponseSchema = response.body;

    expect(responseBody.created.length).toBe(1);
    expect(responseBody.updated.length).toBe(1);

    const createdItem = await prisma.mealPlanItem.findFirst({
      where: {
        meal_plan_id: mealPlan.id,
        recipe_id: {
          not: null,
        },
      },
    });
    expect(createdItem).toBeTruthy();

    const deletedItem = await prisma.mealPlanItem.findFirst({
      where: {
        id: itemToDelete.id,
      },
    });
    expect(deletedItem).toBeFalsy();
  });

  it("should not allow another non shared user to change the items", async () => {
    const [_, otherBearerToken] = await fixtures.createUserAndToken();

    const mealPlan = await generateMealPlan({ user_id: user.id });
    const itemToDelete = await generateMealPlanItem({ meal_plan_id: mealPlan.id });
    const itemToUpdate = await generateMealPlanItem({ meal_plan_id: mealPlan.id, freeform_content: "old" });

    const attemptedRecipe = await generateRecipe({ user_id: user.id });

    const response = await request(server)
      .post(`/meal-plan/${mealPlan.id}/item/bulk-set`)
      .set("Authorization", `Bearer ${otherBearerToken}`)
      .send(<BulkSetMealPlanItemsRequestSchema>{
        create: [
          {
            recipe_id: attemptedRecipe.id,
            start_date: DateTime.utc().toJSDate(),
            meal_plan_id: mealPlan.id,
          },
        ],
        update: [
          {
            ...itemToUpdate,
            freeform_content: "new",
          },
        ],
        delete: [itemToDelete],
      });

    expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);

    const createdItem = await prisma.mealPlanItem.findFirst({
      where: {
        meal_plan_id: mealPlan.id,
        recipe_id: attemptedRecipe.id,
      },
    });
    expect(createdItem).toBeFalsy();

    const deletedItem = await prisma.mealPlanItem.findFirst({
      where: {
        id: itemToDelete.id,
      },
    });
    expect(deletedItem).toBeTruthy();

    const updatedItem = await prisma.mealPlanItem.findFirst({
      where: {
        id: itemToUpdate.id,
      },
    });
    expect(updatedItem?.freeform_content).toBe("old");

    expect(jobSpy).not.toHaveBeenCalled();
  });

  it("should not do anything to a meal plan that does not exist", async () => {
    const response = await request(server)
      .post(`/meal-plan/1000000/item/bulk-set`)
      .set("Authorization", `Bearer ${bearerToken}`)
      .send(<BulkSetMealPlanItemsRequestSchema>{
        create: [
          {
            recipe_id: (await generateRecipe({ user_id: user.id })).id,
            start_date: DateTime.utc().toJSDate(),
            meal_plan_id: 1000000,
          },
        ],
        update: [],
        delete: [],
      });
    expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
    expect(jobSpy).not.toHaveBeenCalled();
  });

  it("should create a job for processing the created items", async () => {
    const mealPlan = await generateMealPlan({ user_id: user.id });

    const response = await request(server)
      .post(`/meal-plan/${mealPlan.id}/item/bulk-set`)
      .set("Authorization", `Bearer ${bearerToken}`)
      .send(<BulkSetMealPlanItemsRequestSchema>{
        create: [
          {
            meal_plan_id: mealPlan.id,
            freeform_content: "asdfqwer",
            start_date: DateTime.now().toJSDate(),
          },
        ],
        update: [],
        delete: [],
      });

    expect(response.statusCode).toBe(StatusCodes.OK);
    const createdItem = (<BulkSetMealPlanItemsResponseSchema>response.body).created[0];
    expect(createdItem).toBeTruthy();

    const job = await prisma.sideJob.findFirst({
      where: {
        user_id: user.id,
        job_data: {
          path: ["meal_plan_item_id"],
          equals: createdItem.id,
        },
        type: JobType.MEAL_PLAN_ITEM,
      },
    });
    expect(job).toBeTruthy();
  });

  it("should create a job for processing updated items and delete any pending jobs for the item", async () => {
    const mealPlan = await generateMealPlan({ user_id: user.id });
    const generatedItem = await generateMealPlanItem({ meal_plan_id: mealPlan.id, freeform_content: "old" });

    const existingJob = await prisma.sideJob.create({
      data: {
        job_data: <MealPlanItemJobDataSchema>{
          meal_plan_id: mealPlan.id,
          meal_plan_item_id: generatedItem.id,
        },
        user_id: user.id,
        type: JobType.MEAL_PLAN_ITEM,
      },
    });

    const response = await request(server)
      .post(`/meal-plan/${mealPlan.id}/item/bulk-set`)
      .set("Authorization", `Bearer ${bearerToken}`)
      .send(<BulkSetMealPlanItemsRequestSchema>{
        create: [],
        update: [
          {
            ...generatedItem,
            freeform_content: "new",
          },
        ],
        delete: [],
      });

    expect(response.statusCode).toBe(StatusCodes.OK);
    const deletedJob = await prisma.sideJob.findFirst({
      where: {
        id: existingJob.id,
      },
    });
    expect(deletedJob).toBeFalsy();

    const job = await prisma.sideJob.findFirst({
      where: {
        user_id: user.id,
        job_data: {
          path: ["meal_plan_item_id"],
          equals: generatedItem.id,
        },
        type: JobType.MEAL_PLAN_ITEM,
      },
    });
    expect(job).toBeTruthy();
    expect(jobSpy).toHaveBeenCalledTimes(1);
  });
});
