import { prisma, User } from "@recipiece/database";
import { generateMealPlan, generateMealPlanShare, generateUserKitchenMembership } from "@recipiece/test";
import { StatusCodes } from "http-status-codes";
import request from "supertest";

describe("Delete Meal Plan Share", () => {
  let user: User;
  let bearerToken: string;
  let otherUser: User;

  beforeEach(async () => {
    [user, bearerToken] = await fixtures.createUserAndToken();
    [otherUser] = await fixtures.createUserAndToken();
  });

  it.each([true, false])(
    "should allow a shared user to delete the share when source user is user is %o",
    async (isUserSourceUser) => {
      const mealPlan = await generateMealPlan({
        user_id: user.id,
      });
      const membership = await generateUserKitchenMembership({
        source_user_id: isUserSourceUser ? user.id : otherUser.id,
        destination_user_id: isUserSourceUser ? otherUser.id : user.id,
        status: "accepted",
      });
      const share = await generateMealPlanShare({
        meal_plan_id: mealPlan.id,
        user_kitchen_membership_id: membership.id,
      });

      const response = await request(server)
        .delete(`/meal-plan/share/${share.id}`)
        .set("Authorization", `Bearer ${bearerToken}`)
        .send();

      expect(response.statusCode).toBe(StatusCodes.OK);

      const record = await prisma.mealPlanShare.findFirst({
        where: {
          id: share.id,
        },
      });
      expect(record).toBeFalsy();
    }
  );

  it("should not allow a user not involved in the membership to delete the share", async () => {
    const mealPlan = await generateMealPlan({
      user_id: user.id,
    });
    const membership = await generateUserKitchenMembership({
      source_user_id: user.id,
      destination_user_id: otherUser.id,
      status: "accepted",
    });
    const share = await generateMealPlanShare({
      meal_plan_id: mealPlan.id,
      user_kitchen_membership_id: membership.id,
    });

    const [_, thirdBearerToken] = await fixtures.createUserAndToken();

    const response = await request(server)
      .delete(`/meal-plan/share/${share.id}`)
      .set("Authorization", `Bearer ${thirdBearerToken}`)
      .send();

    expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);

    const record = await prisma.mealPlanShare.findFirst({
      where: {
        id: share.id,
      },
    });
    expect(record).toBeTruthy();
  });

  it("should not delete a share that does not exist", async () => {
    const response = await request(server)
      .delete(`/meal-plan/share/5000000`)
      .set("Authorization", `Bearer ${bearerToken}`)
      .send();

    expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
  });
});
