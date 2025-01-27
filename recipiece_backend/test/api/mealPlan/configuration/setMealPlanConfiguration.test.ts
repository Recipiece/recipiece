import { User } from "@recipiece/database";
import { generateMealPlan, generateMealPlanShare, generateUserKitchenMembership } from "@recipiece/test";
import { MealPlanConfigurationSchema, SetMealPlanConfigurationRequestSchema } from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import request from "supertest";

describe("Set Meal Plan Configuration", () => {
  let user: User;
  let bearerToken: string;

  beforeEach(async () => {
    [user, bearerToken] = await fixtures.createUserAndToken();
  });

  it("should allow a configuration to be set by the owner", async () => {
    const mealPlan = await generateMealPlan({
      user_id: user.id,
    });

    const response = await request(server)
      .put(`/meal-plan/${mealPlan.id}/configuration`)
      .set("Authorization", `Bearer ${bearerToken}`)
      .send(<SetMealPlanConfigurationRequestSchema>{
        configuration: {
          meats: {
            preferred_thawing_method: "cold_water",
          },
        },
      });

    expect(response.statusCode).toBe(StatusCodes.OK);
    const responseBody: MealPlanConfigurationSchema = response.body;
    expect(responseBody.meats?.preferred_thawing_method).toBe("cold_water");
  });

  it("should allow a configuration to be set by a shared user", async () => {
    const otherMealPlan = await generateMealPlan();
    const membership = await generateUserKitchenMembership({
      source_user_id: otherMealPlan.user_id,
      destination_user_id: user.id,
      status: "accepted",
    });

    const share = await generateMealPlanShare({
      meal_plan_id: otherMealPlan.id,
      user_kitchen_membership_id: membership.id,
    });

    const response = await request(server)
      .put(`/meal-plan/${otherMealPlan.id}/configuration`)
      .set("Authorization", `Bearer ${bearerToken}`)
      .send(<SetMealPlanConfigurationRequestSchema>{
        configuration: {
          meats: {
            preferred_thawing_method: "cold_water",
          },
        },
      });

    expect(response.statusCode).toBe(StatusCodes.OK);
    const responseBody: MealPlanConfigurationSchema = response.body;
    expect(responseBody.meats?.preferred_thawing_method).toBe("cold_water");
  });

  it("should not allow the configuration to be changed by a non shared and non owning user", async () => {
    const otherMealPlan = await generateMealPlan();
    const response = await request(server)
      .put(`/meal-plan/${otherMealPlan.id}/configuration`)
      .set("Authorization", `Bearer ${bearerToken}`)
      .send(<SetMealPlanConfigurationRequestSchema>{
        configuration: {
          meats: {
            preferred_thawing_method: "cold_water",
          },
        },
      });

    expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
  });

  it("should not do anything if the meal plan does not exist", async () => {
    const response = await request(server)
      .put(`/meal-plan/100000/configuration`)
      .set("Authorization", `Bearer ${bearerToken}`)
      .send(<SetMealPlanConfigurationRequestSchema>{
        configuration: {
          meats: {
            preferred_thawing_method: "cold_water",
          },
        },
      });
    expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
  });
});
