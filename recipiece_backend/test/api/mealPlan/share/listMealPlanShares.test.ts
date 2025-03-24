import { User, UserKitchenMembershipStatus } from "@recipiece/database";
import { generateMealPlan, generateMealPlanShare, generateUserKitchenMembership } from "@recipiece/test";
import { ListMealPlanSharesQuerySchema, ListMealPlanSharesResponseSchema } from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import request from "supertest";

describe("List Meal Plan Shares", () => {
  let user: User;
  let bearerToken: string;
  let otherUser: User;
  let otherBearerToken: string;

  beforeEach(async () => {
    [user, bearerToken] = await fixtures.createUserAndToken();
    [otherUser, otherBearerToken] = await fixtures.createUserAndToken();
  });

  it.each([true, false])("should list shares from the user", async (isUserSourceUser) => {
    const mealPlans = [];
    for (let i = 0; i < 5; i++) {
      mealPlans.push(await generateMealPlan({ user_id: user.id }));
    }

    // make some noise
    await generateMealPlan();
    await generateMealPlan();

    const membership = await generateUserKitchenMembership({
      source_user_id: isUserSourceUser ? user.id : otherUser.id,
      destination_user_id: isUserSourceUser ? otherUser.id : user.id,
      status: "accepted",
    });

    const shares = [];
    for (let mealPlan of mealPlans) {
      shares.push(
        await generateMealPlanShare({
          meal_plan_id: mealPlan.id,
          user_kitchen_membership_id: membership.id,
        })
      );
    }

    const otherMembership = await generateUserKitchenMembership({
      source_user_id: user.id,
      status: "accepted",
    });

    for (let mealPlan of mealPlans) {
      shares.push(
        await generateMealPlanShare({
          meal_plan_id: mealPlan.id,
          user_kitchen_membership_id: otherMembership.id,
        })
      );
    }

    const response = await request(server)
      .get("/meal-plan/share/list")
      .query(<ListMealPlanSharesQuerySchema>{
        from_self: true,
        page_number: 0,
      })
      .set("Authorization", `Bearer ${bearerToken}`)
      .send();

    expect(response.statusCode).toBe(StatusCodes.OK);

    const responseBody: ListMealPlanSharesResponseSchema = response.body;

    expect(responseBody.data.length).toBe(10);

    const actualIds = responseBody.data.map((sh) => sh.id).sort();
    const expectedIds = shares.map((sh) => sh.id).sort();

    expect(actualIds).toEqual(expectedIds);
  });

  it.each([true, false])("should list shares targeting the user", async (isUserSourceUser) => {
    const mealPlans = [];
    for (let i = 0; i < 5; i++) {
      mealPlans.push(await generateMealPlan({ user_id: user.id }));
    }

    // make some noise
    await generateMealPlan();
    await generateMealPlan();

    const membership = await generateUserKitchenMembership({
      source_user_id: isUserSourceUser ? user.id : otherUser.id,
      destination_user_id: isUserSourceUser ? otherUser.id : user.id,
      status: "accepted",
    });

    const shares = [];
    for (let mealPlan of mealPlans) {
      shares.push(
        await generateMealPlanShare({
          meal_plan_id: mealPlan.id,
          user_kitchen_membership_id: membership.id,
        })
      );
    }

    // let the user share these meal plans with another user
    const otherMembership = await generateUserKitchenMembership({
      source_user_id: user.id,
      status: "accepted",
    });

    for (let mealPlan of mealPlans) {
      await generateMealPlanShare({
        meal_plan_id: mealPlan.id,
        user_kitchen_membership_id: otherMembership.id,
      });
    }

    const response = await request(server)
      .get("/meal-plan/share/list")
      .query(<ListMealPlanSharesQuerySchema>{
        targeting_self: true,
        page_number: 0,
      })
      .set("Authorization", `Bearer ${otherBearerToken}`)
      .send();

    expect(response.statusCode).toBe(StatusCodes.OK);

    const responseBody: ListMealPlanSharesResponseSchema = response.body;

    expect(responseBody.data.length).toBe(5);

    const actualIds = responseBody.data.map((sh) => sh.id).sort();
    const expectedIds = shares.map((sh) => sh.id).sort();

    expect(actualIds).toEqual(expectedIds);
  });

  it.each(<UserKitchenMembershipStatus[]>["pending", "denied"])("should not list shares belonging to a membership with status %o", async (membershipStatus) => {
    const mealPlans = [];
    for (let i = 0; i < 3; i++) {
      mealPlans.push(await generateMealPlan({ user_id: user.id }));
    }

    // make some noise
    await generateMealPlan();
    await generateMealPlan();

    const membership = await generateUserKitchenMembership({
      source_user_id: user.id,
      destination_user_id: otherUser.id,
      status: membershipStatus,
    });

    const shares = [];
    for (let mealPlan of mealPlans) {
      shares.push(
        await generateMealPlanShare({
          meal_plan_id: mealPlan.id,
          user_kitchen_membership_id: membership.id,
        })
      );
    }

    const response = await request(server)
      .get("/meal-plan/share/list")
      .query(<ListMealPlanSharesQuerySchema>{
        from_self: true,
        page_number: 0,
      })
      .set("Authorization", `Bearer ${bearerToken}`)
      .send();

    expect(response.statusCode).toBe(StatusCodes.OK);

    const responseBody: ListMealPlanSharesResponseSchema = response.body;

    expect(responseBody.data.length).toBe(0);
  });

  it.each([true, false])("should list shares belonging only to a single membership", async (isUserSourceUser) => {
    const mealPlans = [];
    for (let i = 0; i < 5; i++) {
      mealPlans.push(await generateMealPlan({ user_id: user.id }));
    }

    // make some noise
    await generateMealPlan();
    await generateMealPlan();

    const membership = await generateUserKitchenMembership({
      source_user_id: isUserSourceUser ? user.id : otherUser.id,
      destination_user_id: isUserSourceUser ? otherUser.id : user.id,
      status: "accepted",
    });

    const shares = [];
    for (let mealPlan of mealPlans) {
      shares.push(
        await generateMealPlanShare({
          meal_plan_id: mealPlan.id,
          user_kitchen_membership_id: membership.id,
        })
      );
    }

    // let the user share these meal plans with another user
    const otherMembership = await generateUserKitchenMembership({
      source_user_id: user.id,
      status: "accepted",
    });

    for (let mealPlan of mealPlans) {
      await generateMealPlanShare({
        meal_plan_id: mealPlan.id,
        user_kitchen_membership_id: otherMembership.id,
      });
    }

    const response = await request(server)
      .get("/meal-plan/share/list")
      .query(<ListMealPlanSharesQuerySchema>{
        from_self: true,
        page_number: 0,
        user_kitchen_membership_id: membership.id,
      })
      .set("Authorization", `Bearer ${bearerToken}`)
      .send();

    expect(response.statusCode).toBe(StatusCodes.OK);

    const responseBody: ListMealPlanSharesResponseSchema = response.body;

    expect(responseBody.data.length).toBe(5);

    const actualIds = responseBody.data.map((sh) => sh.id).sort();
    const expectedIds = shares.map((sh) => sh.id).sort();

    expect(actualIds).toEqual(expectedIds);
  });
});
