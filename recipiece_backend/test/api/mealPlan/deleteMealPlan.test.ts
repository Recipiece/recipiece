import { prisma, User } from "@recipiece/database";
import { generateMealPlan, generateMealPlanShare, generateUserKitchenMembership } from "@recipiece/test";
import { StatusCodes } from "http-status-codes";
import request from "supertest";
import { JobType } from "../../../src/util/constant";

describe("Delete Meal Plan", () => {
  let user: User;
  let bearerToken: string;

  beforeEach(async () => {
    [user, bearerToken] = await fixtures.createUserAndToken();
  });

  it("should delete a meal plan", async () => {
    const mealPlan = await generateMealPlan({ user_id: user.id });
    const response = await request(server)
      .delete(`/meal-plan/${mealPlan.id}`)
      .set("Authorization", `Bearer ${bearerToken}`)
      .send();

    expect(response.statusCode).toBe(StatusCodes.OK);

    const matchingPlan = await prisma.mealPlan.findFirst({
      where: {
        id: mealPlan.id,
      },
    });
    expect(matchingPlan).toBeFalsy();
  });

  it("should not allow another user to delete a meal plan", async () => {
    const [_, otherBearerToken] = await fixtures.createUserAndToken();

    const mealPlan = await generateMealPlan({ user_id: user.id });
    const response = await request(server)
      .delete(`/meal-plan/${mealPlan.id}`)
      .set("Authorization", `Bearer ${otherBearerToken}`)
      .send();

    expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);

    const matchingPlan = await prisma.mealPlan.findFirst({
      where: {
        id: mealPlan.id,
      },
    });
    expect(matchingPlan).toBeTruthy();
  });

  it("should not allow a shared user to delete a meal plan", async () => {
    const [otherUser, otherBearerToken] = await fixtures.createUserAndToken();

    const mealPlan = await generateMealPlan({ user_id: user.id });
    const membership = await generateUserKitchenMembership({
      source_user_id: user.id,
      destination_user_id: otherUser.id,
      status: "accepted",
    });
    const share = await generateMealPlanShare({
      user_kitchen_membership_id: membership.id,
      meal_plan_id: mealPlan.id,
    });

    const response = await request(server)
      .delete(`/meal-plan/${mealPlan.id}`)
      .set("Authorization", `Bearer ${otherBearerToken}`)
      .send();
    expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);

    const matchingPlan = await prisma.mealPlan.findFirst({
      where: {
        id: mealPlan.id,
      },
    });
    expect(matchingPlan).toBeTruthy();
  });

  it("should purge any jobs related to the meal plan", async () => {
    const mealPlan = await generateMealPlan({ user_id: user.id });
    const job = await prisma.sideJob.create({
      data: {
        type: JobType.MEAL_PLAN_ITEM,
        job_data: {
          meal_plan_id: mealPlan.id,
        },
        user_id: user.id,
      },
    });

    const response = await request(server)
      .delete(`/meal-plan/${mealPlan.id}`)
      .set("Authorization", `Bearer ${bearerToken}`)
      .send();
    expect(response.statusCode).toBe(StatusCodes.OK);

    const deletedJob = await prisma.sideJob.findFirst({
      where: {
        id: job.id,
      },
    });
    expect(deletedJob).toBeFalsy();
  });
});
