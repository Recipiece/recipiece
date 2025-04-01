import { User } from "@recipiece/database";
import { CreateMealPlanRequestSchema, MealPlanSchema } from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import request from "supertest";

describe("Create Meal Plan", () => {
  let user: User;
  let bearerToken: string;

  beforeEach(async () => {
    [user, bearerToken] = await fixtures.createUserAndToken();
  });

  it("should allow a user to create a meal plan", async () => {
    const expectedBody: CreateMealPlanRequestSchema = {
      name: "Test Meal Plan",
    };

    const response = await request(server).post("/meal-plan").set("Authorization", `Bearer ${bearerToken}`).send(expectedBody);

    expect(response.statusCode).toBe(StatusCodes.CREATED);

    const actualMealPlan: MealPlanSchema = response.body;
    expect(actualMealPlan.user_id).toBe(user.id);
    expect(actualMealPlan.name).toBe(expectedBody.name);
  });
});
