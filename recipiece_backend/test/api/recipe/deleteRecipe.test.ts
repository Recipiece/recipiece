import { User } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import request from "supertest";

describe("Delete Recipes", () => {
  let user: User;
  let bearerToken: string;

  beforeEach(async () => {
    const userAndToken = await fixtures.createUserAndToken();
    user = userAndToken[0];
    bearerToken = userAndToken[1];
  });

  it("should allow a user to delete their recipe", async () => {
    const recipe = await prisma.recipe.create({
      data: {
        name: "asdfqwer",
        description: "asdfqwer",
        user_id: user.id,
      },
    });

    const response = await request(server)
      .delete(`/recipe/${recipe.id}`)
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toEqual(StatusCodes.OK);

    const deletedRecipe = await prisma.recipe.findUnique({
      where: {
        id: recipe.id,
      },
    });
    expect(deletedRecipe).toBeFalsy();
  });

  it("should not allow a user to delete a recipe they do not own", async () => {
    const [otherUser] = await fixtures.createUserAndToken("otheruser@recipiece.org");
    const recipe = await prisma.recipe.create({
      data: {
        name: "asdfqwer",
        description: "asdfqwer",
        user_id: otherUser.id,
      },
    });

    const response = await request(server)
      .delete(`/recipe/${recipe.id}`)
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);

    const deletedRecipe = await prisma.recipe.findUnique({
      where: {
        id: recipe.id,
      },
    });
    expect(deletedRecipe).toBeTruthy();
  });

  it(`should ${StatusCodes.NOT_FOUND} when the recipe does not exist`, async () => {
    const response = await request(server)
      .delete("/recipe/5000")
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`);
    expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
  });
});
