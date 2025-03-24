import { prisma, User } from "@recipiece/database";
import { generateMealPlan, generateMealPlanShare, generateRecipe, generateUser, generateUserKitchenMembership } from "@recipiece/test";
import { CreateMealPlanItemRequestSchema, MealPlanItemSchema } from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import { DateTime } from "luxon";
import request from "supertest";
import { mealPlanItemQueue } from "../../../../src/job";
import { JobType } from "../../../../src/util/constant";

describe("Create Meal Plan Item", () => {
  let user: User;
  let bearerToken: string;

  beforeEach(async () => {
    [user, bearerToken] = await fixtures.createUserAndToken();
  });

  it("should allow a user to create a meal plan item with freeform content", async () => {
    const jobSpy = jest.spyOn(mealPlanItemQueue, "add");

    const mealPlan = await generateMealPlan({ user_id: user.id });
    const item: CreateMealPlanItemRequestSchema = {
      meal_plan_id: mealPlan.id,
      start_date: DateTime.utc().toISO(),
      freeform_content: "asdfqwer",
      notes: "zxcvuiop",
    };

    const response = await request(server)
      .post(`/meal-plan/${mealPlan.id}/item`)
      .set("Authorization", `Bearer ${bearerToken}`)
      .send({ ...item });

    expect(response.status).toBe(StatusCodes.OK);
    const createdItem: MealPlanItemSchema = response.body;

    expect(createdItem.meal_plan_id).toBe(mealPlan.id);
    expect(createdItem.recipe).toBeFalsy();
    expect(createdItem.recipe_id).toBeFalsy();
    expect(createdItem.freeform_content).toBe(item.freeform_content);
    expect(createdItem.notes).toBe(item.notes);

    const dbItem = await prisma.mealPlanItem.findFirst({
      where: {
        id: createdItem.id,
      },
    });
    expect(dbItem).toBeTruthy();

    const job = await prisma.sideJob.findFirst({
      where: {
        type: JobType.MEAL_PLAN_ITEM,
        job_data: {
          path: ["meal_plan_id"],
          equals: mealPlan.id,
        },
      },
    });
    expect(job).toBeTruthy();
    expect(jobSpy).toHaveBeenCalled();
  });

  it("should allow a user to create a meal plan item with a recipe that they own", async () => {
    const jobSpy = jest.spyOn(mealPlanItemQueue, "add");

    const mealPlan = await generateMealPlan({ user_id: user.id });
    const recipe = await generateRecipe({ user_id: user.id });

    const item: CreateMealPlanItemRequestSchema = {
      meal_plan_id: mealPlan.id,
      start_date: DateTime.utc().toISO(),
      recipe_id: recipe.id,
      notes: "zxcvuiop",
    };

    const response = await request(server)
      .post(`/meal-plan/${mealPlan.id}/item`)
      .set("Authorization", `Bearer ${bearerToken}`)
      .send({ ...item });

    expect(response.status).toBe(StatusCodes.OK);
    const createdItem: MealPlanItemSchema = response.body;

    expect(createdItem.meal_plan_id).toBe(mealPlan.id);
    expect(createdItem.recipe).toBeTruthy();
    expect(createdItem.recipe!.id).toBe(recipe.id);
    expect(createdItem.recipe_id).toBe(recipe.id);
    expect(createdItem.freeform_content).toBeFalsy();
    expect(createdItem.notes).toBe(item.notes);

    const dbItem = await prisma.mealPlanItem.findFirst({
      where: {
        id: createdItem.id,
      },
    });
    expect(dbItem).toBeTruthy();

    const job = await prisma.sideJob.findFirst({
      where: {
        type: JobType.MEAL_PLAN_ITEM,
        job_data: {
          path: ["meal_plan_id"],
          equals: mealPlan.id,
        },
      },
    });
    expect(job).toBeTruthy();
    expect(jobSpy).toHaveBeenCalled();
  });

  it("should allow a shared recipe to be set in a meal plan item", async () => {
    const jobSpy = jest.spyOn(mealPlanItemQueue, "add");

    const otherUser = await generateUser();
    const otherRecipe = await generateRecipe({ user_id: otherUser.id });
    const membership = await generateUserKitchenMembership({
      source_user_id: otherUser.id,
      destination_user_id: user.id,
      status: "accepted",
    });

    const mealPlan = await generateMealPlan({ user_id: user.id });

    const item: CreateMealPlanItemRequestSchema = {
      meal_plan_id: mealPlan.id,
      start_date: DateTime.utc().toISO(),
      recipe_id: otherRecipe.id,
      notes: "zxcvuiop",
    };

    const response = await request(server)
      .post(`/meal-plan/${mealPlan.id}/item`)
      .set("Authorization", `Bearer ${bearerToken}`)
      .send({ ...item });

    expect(response.status).toBe(StatusCodes.OK);
    const createdItem: MealPlanItemSchema = response.body;

    expect(createdItem.meal_plan_id).toBe(mealPlan.id);
    expect(createdItem.recipe).toBeTruthy();
    expect(createdItem.recipe!.id).toBe(otherRecipe.id);
    expect(createdItem.recipe_id).toBe(otherRecipe.id);
    expect(createdItem.freeform_content).toBeFalsy();
    expect(createdItem.notes).toBe(item.notes);

    const dbItem = await prisma.mealPlanItem.findFirst({
      where: {
        id: createdItem.id,
      },
    });
    expect(dbItem).toBeTruthy();

    const job = await prisma.sideJob.findFirst({
      where: {
        type: JobType.MEAL_PLAN_ITEM,
        job_data: {
          path: ["meal_plan_id"],
          equals: mealPlan.id,
        },
      },
    });
    expect(job).toBeTruthy();
    expect(jobSpy).toHaveBeenCalled();
  });

  /**
   * Not sure if this should actually be the case or not. Current implementation says no.
   * See the skipped test over in bulkSetMealPlanItems.test.ts
   */
  xit("should not allow a non shared recipe owned by another user to be used for the meal plan item", async () => {
    const jobSpy = jest.spyOn(mealPlanItemQueue, "add");

    const otherUser = await generateUser();
    const otherRecipe = await generateRecipe({ user_id: otherUser.id });

    const mealPlan = await generateMealPlan({ user_id: user.id });

    const item: CreateMealPlanItemRequestSchema = {
      meal_plan_id: mealPlan.id,
      start_date: DateTime.utc().toISO(),
      recipe_id: otherRecipe.id,
      notes: "zxcvuiop",
    };

    const response = await request(server)
      .post(`/meal-plan/${mealPlan.id}/item`)
      .set("Authorization", `Bearer ${bearerToken}`)
      .send({ ...item });

    expect(response.status).toBe(StatusCodes.NOT_FOUND);

    const dbItem = await prisma.mealPlanItem.findFirst({
      where: {
        recipe_id: otherRecipe.id,
      },
    });
    expect(dbItem).toBeFalsy();

    const job = await prisma.sideJob.findFirst({
      where: {
        type: JobType.MEAL_PLAN_ITEM,
        job_data: {
          path: ["meal_plan_id"],
          equals: mealPlan.id,
        },
      },
    });
    expect(job).toBeFalsy();
    expect(jobSpy).not.toHaveBeenCalled();
  });

  it("should allow a shared user to create a meal plan item", async () => {
    const otherUser = await generateUser();
    const otherMealPlan = await generateMealPlan({ user_id: otherUser.id });
    const membership = await generateUserKitchenMembership({
      source_user_id: otherUser.id,
      destination_user_id: user.id,
      status: "accepted",
    });
    const share = await generateMealPlanShare({
      user_kitchen_membership_id: membership.id,
      meal_plan_id: otherMealPlan.id,
    });

    const item: CreateMealPlanItemRequestSchema = {
      meal_plan_id: otherMealPlan.id,
      start_date: DateTime.utc().toISO(),
      freeform_content: "asdfqwer",
      notes: "zxcvuiop",
    };

    const response = await request(server)
      .post(`/meal-plan/${otherMealPlan.id}/item`)
      .set("Authorization", `Bearer ${bearerToken}`)
      .send({ ...item });

    expect(response.status).toBe(StatusCodes.OK);
  });

  it("should not allow another user to create a meal plan item", async () => {
    const otherUser = await generateUser();
    const otherMealPlan = await generateMealPlan({ user_id: otherUser.id });

    const item: CreateMealPlanItemRequestSchema = {
      meal_plan_id: otherMealPlan.id,
      start_date: DateTime.utc().toISO(),
      freeform_content: "asdfqwer",
      notes: "zxcvuiop",
    };

    const response = await request(server)
      .post(`/meal-plan/${otherMealPlan.id}/item`)
      .set("Authorization", `Bearer ${bearerToken}`)
      .send({ ...item });

    expect(response.status).toBe(StatusCodes.NOT_FOUND);
  });

  it("should not create items for meal plans that do not exist", async () => {
    const item: CreateMealPlanItemRequestSchema = {
      meal_plan_id: 100000,
      start_date: DateTime.utc().toISO(),
      freeform_content: "asdfqwer",
      notes: "zxcvuiop",
    };

    const response = await request(server)
      .post(`/meal-plan/100000/item`)
      .set("Authorization", `Bearer ${bearerToken}`)
      .send({ ...item });

    expect(response.status).toBe(StatusCodes.NOT_FOUND);
  });
});
