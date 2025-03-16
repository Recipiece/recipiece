import { prisma, User, UserKitchenMembershipStatus } from "@recipiece/database";
import { generateMealPlan, generateMealPlanShare, generateUserKitchenMembership } from "@recipiece/test";
import { CreateMealPlanShareRequestSchema, MealPlanShareSchema } from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import request from "supertest";

describe("Create Meal Plan Share", () => {
  let user: User;
  let bearerToken: string;
  let otherUser: User;
  let otherBearerToken: string;

  beforeEach(async () => {
    [user, bearerToken] = await fixtures.createUserAndToken();
    [otherUser, otherBearerToken] = await fixtures.createUserAndToken();
  });

  it.each([true, false])("should allow a user to share a meal plan when source user is user is %o", async (isUserSourceUser) => {
    const mealPlan = await generateMealPlan({
      user_id: user.id,
    });
    const membership = await generateUserKitchenMembership({
      source_user_id: isUserSourceUser ? user.id : otherUser.id,
      destination_user_id: isUserSourceUser ? otherUser.id : user.id,
      status: "accepted",
    });

    const response = await request(server)
      .post("/meal-plan/share")
      .set("Authorization", bearerToken)
      .send(<CreateMealPlanShareRequestSchema>{
        meal_plan_id: mealPlan.id,
        user_kitchen_membership_id: membership.id,
      });

    expect(response.statusCode).toBe(StatusCodes.CREATED);
    const responseBody: MealPlanShareSchema = response.body;

    expect(responseBody.meal_plan_id).toBe(mealPlan.id);
    expect(responseBody.user_kitchen_membership_id).toBe(membership.id);

    const record = await prisma.mealPlanShare.findFirst({
      where: {
        id: responseBody.id,
      },
    });
    expect(record).toBeTruthy();
  });

  it("should not allow a user to share a meal plan they do not own", async () => {
    const mealPlan = await generateMealPlan({
      user_id: otherUser.id,
    });
    await generateUserKitchenMembership({
      source_user_id: user.id,
      destination_user_id: otherUser.id,
      status: "accepted",
    });

    const outsideMembership = await generateUserKitchenMembership({
      source_user_id: user.id,
      status: "accepted",
    });

    const response = await request(server)
      .post("/meal-plan/share")
      .set("Authorization", bearerToken)
      .send(<CreateMealPlanShareRequestSchema>{
        meal_plan_id: mealPlan.id,
        user_kitchen_membership_id: outsideMembership.id,
      });

    expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);

    const record = await prisma.mealPlanShare.findFirst({
      where: {
        meal_plan_id: mealPlan.id,
      },
    });
    expect(record).toBeFalsy();
  });

  it.each(<UserKitchenMembershipStatus[]>["pending", "denied"])(
    "should not allow a user to share a meal plan to a membership with status %o",
    async (membershipStatus) => {
      const mealPlan = await generateMealPlan({
        user_id: otherUser.id,
      });
      const membership = await generateUserKitchenMembership({
        source_user_id: user.id,
        destination_user_id: otherUser.id,
        status: membershipStatus,
      });

      const response = await request(server)
        .post("/meal-plan/share")
        .set("Authorization", bearerToken)
        .send(<CreateMealPlanShareRequestSchema>{
          meal_plan_id: mealPlan.id,
          user_kitchen_membership_id: membership.id,
        });

      expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);

      const record = await prisma.mealPlanShare.findFirst({
        where: {
          meal_plan_id: mealPlan.id,
        },
      });
      expect(record).toBeFalsy();
    }
  );

  it("should not share a meal plan that does not exist", async () => {
    const membership = await generateUserKitchenMembership({
      source_user_id: user.id,
      destination_user_id: otherUser.id,
      status: "accepted",
    });

    const response = await request(server)
      .post("/meal-plan/share")
      .set("Authorization", bearerToken)
      .send(<CreateMealPlanShareRequestSchema>{
        meal_plan_id: 1000000,
        user_kitchen_membership_id: membership.id,
      });

    expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
  });

  it("should not allow a meal plan to be shared twice to the same membership", async () => {
    const mealPlan = await generateMealPlan({
      user_id: user.id,
    });
    const membership = await generateUserKitchenMembership({
      source_user_id: user.id,
      destination_user_id: otherUser.id,
      status: "accepted",
    });
    await generateMealPlanShare({
      meal_plan_id: mealPlan.id,
      user_kitchen_membership_id: membership.id,
    });

    const response = await request(server)
      .post("/meal-plan/share")
      .set("Authorization", bearerToken)
      .send(<CreateMealPlanShareRequestSchema>{
        meal_plan_id: mealPlan.id,
        user_kitchen_membership_id: membership.id,
      });

    expect(response.statusCode).toBe(StatusCodes.CONFLICT);
  });
});
