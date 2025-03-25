import { User, UserKitchenMembershipStatus } from "@recipiece/database";
import { generateMealPlan, generateMealPlanShare, generateUserKitchenMembership } from "@recipiece/test";
import { MealPlanSchema } from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import request from "supertest";

describe("Get Meal Plan", () => {
  let user: User;
  let bearerToken: string;

  beforeEach(async () => {
    [user, bearerToken] = await fixtures.createUserAndToken();
  });

  it("should allow a user to get a meal plan", async () => {
    const existingMealPlan = await generateMealPlan({ user_id: user.id });

    const response = await request(server).get(`/meal-plan/${existingMealPlan.id}`).set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toEqual(StatusCodes.OK);
    const mealPlanBody = response.body as MealPlanSchema;
    expect(mealPlanBody.id).toEqual(existingMealPlan.id);
  });

  it("should not retrieve a meal plan that is not shared and does not belong to the requesting user", async () => {
    const existingMealPlan = await generateMealPlan();

    const response = await request(server).get(`/meal-plan/${existingMealPlan.id}`).set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
  });

  it("should not get a meal plan that does not exist", async () => {
    const response = await request(server).get(`/meal-plan/500000`).set("Authorization", `Bearer ${bearerToken}`);
    expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
  });

  it.each([true, false])("should get a shared meal plan when user is source user is %o", async (isUserSourceUser) => {
    const othersMealPlan = await generateMealPlan();
    const membership = await generateUserKitchenMembership({
      source_user_id: isUserSourceUser ? user.id : othersMealPlan.user_id,
      destination_user_id: isUserSourceUser ? othersMealPlan.user_id : user.id,
      status: "accepted",
    });
    const share = await generateMealPlanShare({
      meal_plan_id: othersMealPlan.id,
      user_kitchen_membership_id: membership.id,
    });

    const response = await request(server).get(`/meal-plan/${othersMealPlan.id}`).set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toBe(StatusCodes.OK);
    const responseData: MealPlanSchema = response.body;

    expect(responseData.shares?.length).toBe(1);
    expect(responseData.shares![0].id).toBe(share.id);
    expect(responseData.shares![0].meal_plan_id).toBe(othersMealPlan.id);
  });

  it.each(<UserKitchenMembershipStatus[]>["pending", "denied"])("should not get a shared meal plan where the membership has a status of %o", async (status) => {
    const otherMealPlan = await generateMealPlan();

    const membership = await generateUserKitchenMembership({
      source_user_id: otherMealPlan.user_id,
      destination_user_id: user.id,
      status: status,
    });

    const share = await generateMealPlanShare({
      meal_plan_id: otherMealPlan.id,
      user_kitchen_membership_id: membership.id,
    });

    const response = await request(server).get(`/meal-plan/${otherMealPlan.id}`).set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
  });
});
