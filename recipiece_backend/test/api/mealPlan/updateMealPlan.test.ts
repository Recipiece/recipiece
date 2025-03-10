import { prisma, User } from "@recipiece/database";
import { generateMealPlan, generateUser, generateUserKitchenMembership } from "@recipiece/test";
import { MealPlanSchema, UpdateMealPlanRequestSchema } from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import request from "supertest";

describe("Update Meal Plan", () => {
  let user: User;
  let bearerToken: string;

  beforeEach(async () => {
    [user, bearerToken] = await fixtures.createUserAndToken();
  });

  it("should allow a user to update their meal plan", async () => {
    const mealPlan = await generateMealPlan({ user_id: user.id });

    const newName = "new name";

    const response = await request(server)
      .put("/meal-plan")
      .set("Authorization", `Bearer ${bearerToken}`)
      .send(<UpdateMealPlanRequestSchema>{
        id: mealPlan.id,
        name: newName,
      });

    expect(response.statusCode).toBe(StatusCodes.OK);
    const updatedMealPlanBody = <MealPlanSchema>response.body;

    expect(updatedMealPlanBody.name).toBe(newName);

    const updatedMealPlanRecord = await prisma.mealPlan.findFirst({
      where: {
        id: mealPlan.id,
      },
    });

    expect(updatedMealPlanRecord).toBeTruthy();
    expect(updatedMealPlanRecord!.name).toBe(newName);
  });

  it("should not update a meal plan that does not exist", async () => {
    const newName = "new name";
    const response = await request(server)
      .put("/meal-plan")
      .set("Authorization", `Bearer ${bearerToken}`)
      .send(<UpdateMealPlanRequestSchema>{
        id: 100000000,
        name: newName,
      });

    expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
  });

  it("should not allow another user to update a meal plan they do not own", async () => {
    const otherMealPlan = await generateMealPlan();

    const newName = "new name";

    const response = await request(server)
      .put("/meal-plan")
      .set("Authorization", `Bearer ${bearerToken}`)
      .send(<UpdateMealPlanRequestSchema>{
        id: otherMealPlan.id,
        name: newName,
      });

    expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);

    const updatedMealPlanRecord = await prisma.mealPlan.findFirst({
      where: {
        id: otherMealPlan.id,
      },
    });

    expect(updatedMealPlanRecord).toBeTruthy();
    expect(updatedMealPlanRecord!.name).toBe(otherMealPlan.name);
  });

  it("should not allow a shared user to update a meal plan", async () => {
    const otherUser = await generateUser();
    await generateUserKitchenMembership({
      source_user_id: otherUser.id,
      destination_user_id: user.id,
      status: "accepted",
    });
    const otherMealPlan = await generateMealPlan({ user_id: otherUser.id });

    const newName = "new name";

    const response = await request(server)
      .put("/meal-plan")
      .set("Authorization", `Bearer ${bearerToken}`)
      .send(<UpdateMealPlanRequestSchema>{
        id: otherMealPlan.id,
        name: newName,
      });

    expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);

    const updatedMealPlanRecord = await prisma.mealPlan.findFirst({
      where: {
        id: otherMealPlan.id,
      },
    });

    expect(updatedMealPlanRecord).toBeTruthy();
    expect(updatedMealPlanRecord!.name).toBe(otherMealPlan.name);
  });
});
