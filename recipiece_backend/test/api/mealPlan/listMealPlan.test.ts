import { User, UserKitchenMembershipStatus } from "@recipiece/database";
import { generateMealPlan, generateMealPlanShare, generateUser, generateUserKitchenMembership } from "@recipiece/test";
import { ListMealPlansQuerySchema, ListMealPlansResponseSchema } from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import request from "supertest";

describe("List Meal Plan", () => {
  let user: User;
  let bearerToken: string;

  beforeEach(async () => {
    [user, bearerToken] = await fixtures.createUserAndToken();
  });

  it("should list meal plans for a user", async () => {
    const mealPlans = [];
    for (let i = 0; i < 10; i++) {
      mealPlans.push(await generateMealPlan({ user_id: user.id }));
    }

    // make some noise!
    await generateMealPlan();
    await generateMealPlan();
    await generateMealPlan();

    const response = await request(server)
      .get("/meal-plan/list")
      .query({
        page_number: 0,
      })
      .set("Authorization", `Bearer ${bearerToken}`)
      .send();

    expect(response.statusCode).toBe(StatusCodes.OK);
    const responseBody: ListMealPlansResponseSchema = response.body;

    expect(responseBody.data.length).toBe(10);
    const expectedIds = mealPlans.map((mp) => mp.id);
    responseBody.data.forEach((bodyMealPlan) => {
      expect(expectedIds.includes(bodyMealPlan.id)).toBeTruthy();
      expect(bodyMealPlan.user_id).toBe(user.id);
    });
  });

  it("should page", async () => {
    const mealPlans = [];
    for (let i = 0; i < 10; i++) {
      mealPlans.push(await generateMealPlan({ user_id: user.id }));
    }

    const response = await request(server)
      .get("/meal-plan/list")
      .query({
        page_size: 5,
        page_number: 0,
      })
      .set("Authorization", `Bearer ${bearerToken}`)
      .send();

    expect(response.statusCode).toBe(StatusCodes.OK);
    const responseBody: ListMealPlansResponseSchema = response.body;
    expect(responseBody.data.length).toBe(5);
  });

  describe("Shared Meal Plan", () => {
    it("should list meal plans shared to you", async () => {
      const otherUserAll = await generateUser();
      const allMembership = await generateUserKitchenMembership({
        source_user_id: otherUserAll.id,
        destination_user_id: user.id,
        status: "accepted",
      });
      const otherMealPlanAll = await generateMealPlan({ user_id: otherUserAll.id });
      await generateMealPlanShare({
        user_kitchen_membership_id: allMembership.id,
        meal_plan_id: otherMealPlanAll.id,
      });

      const userMealPlans = [];
      for (let i = 0; i < 10; i++) {
        userMealPlans.push(await generateMealPlan({ user_id: user.id }));
      }

      const response = await request(server)
        .get("/meal-plan/list")
        .query(<ListMealPlansQuerySchema>{
          page_number: 0,
          shared_meal_plans_filter: "include",
        })
        .set("Authorization", `Bearer ${bearerToken}`)
        .send();

      expect(response.statusCode).toBe(StatusCodes.OK);
      const responseData: ListMealPlansResponseSchema = response.body;

      expect(responseData.data.length).toBe(11);
      const expectedIds = [...userMealPlans, otherMealPlanAll].map((mp) => mp.id);
      responseData.data.forEach((mp) => {
        expect(expectedIds.includes(mp.id)).toBeTruthy();
      });
    });

    it("should not list meal plans shared to you", async () => {
      const otherUserAll = await generateUser();
      await generateUserKitchenMembership({
        source_user_id: otherUserAll.id,
        destination_user_id: user.id,
        status: "accepted",
      });
      await generateMealPlan({ user_id: otherUserAll.id });

      const userMealPlans = [];
      for (let i = 0; i < 10; i++) {
        userMealPlans.push(await generateMealPlan({ user_id: user.id }));
      }

      const response = await request(server)
        .get("/meal-plan/list")
        .query(<ListMealPlansQuerySchema>{
          page_number: 0,
          shared_meal_plans_filter: "exclude",
        })
        .set("Authorization", `Bearer ${bearerToken}`)
        .send();

      expect(response.statusCode).toBe(StatusCodes.OK);
      const responseData: ListMealPlansResponseSchema = response.body;

      expect(responseData.data.length).toBe(10);
      const expectedIds = userMealPlans.map((mp) => mp.id);
      responseData.data.forEach((mp) => {
        expect(mp.user_id).toBe(user.id);
        expect(expectedIds.includes(mp.id)).toBeTruthy();
      });
    });

    it.each(<UserKitchenMembershipStatus[]>["pending", "denied"])(
      "should not list meal plans belonging to a membership with status %o",
      async (membershipStatus) => {
        const otherUserSelective = await generateUser();
        await generateUserKitchenMembership({
          source_user_id: otherUserSelective.id,
          destination_user_id: user.id,
          status: membershipStatus,
        });
        await generateMealPlan({ user_id: otherUserSelective.id });

        const userMealPlans = [];
        for (let i = 0; i < 10; i++) {
          userMealPlans.push(await generateMealPlan({ user_id: user.id }));
        }

        const response = await request(server)
          .get("/meal-plan/list")
          .query(<ListMealPlansQuerySchema>{
            page_number: 0,
            shared_meal_plans_filter: "include",
          })
          .set("Authorization", `Bearer ${bearerToken}`)
          .send();

        expect(response.statusCode).toBe(StatusCodes.OK);
        const responseData: ListMealPlansResponseSchema = response.body;

        expect(responseData.data.length).toBe(10);
        const expectedIds = userMealPlans.map((mp) => mp.id);
        responseData.data.forEach((mp) => {
          expect(mp.user_id).toBe(user.id);
          expect(expectedIds.includes(mp.id)).toBeTruthy();
        });
      }
    );
  });
});
