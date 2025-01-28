import { prisma, User } from "@recipiece/database";
import { generateMealPlan, generateMealPlanItem, generateMealPlanShare, generateRecipe, generateUserKitchenMembership } from "@recipiece/test";
import { BulkSetMealPlanItemsRequestSchema, BulkSetMealPlanItemsResponseSchema } from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import { DateTime } from "luxon";
import request from "supertest";

describe("Bulk Set Meal Plan Items", () => {
  let user: User;
  let bearerToken: string;

  beforeEach(async () => {
    [user, bearerToken] = await fixtures.createUserAndToken();
  });

  it("should create new items", async () => {
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
        delete: [generatedItem],
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

  it("should allow access from a shared user", async () => {
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
            recipe_id: (await generateRecipe({ user_id: user.id })).id,
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

  it("should not allow another user to change the items", async () => {
    const [_, otherBearerToken] = await fixtures.createUserAndToken();

    const mealPlan = await generateMealPlan({ user_id: user.id });
    const itemToDelete = await generateMealPlanItem({ meal_plan_id: mealPlan.id });
    const itemToUpdate = await generateMealPlanItem({ meal_plan_id: mealPlan.id, freeform_content: "old" });

    const response = await request(server)
      .post(`/meal-plan/${mealPlan.id}/item/bulk-set`)
      .set("Authorization", `Bearer ${otherBearerToken}`)
      .send(<BulkSetMealPlanItemsRequestSchema>{
        create: [
          {
            recipe_id: (await generateRecipe({ user_id: user.id })).id,
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
        recipe_id: {
          not: null,
        },
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
  });
});
