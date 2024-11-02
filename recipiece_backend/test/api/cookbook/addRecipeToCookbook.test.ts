import { User } from "@prisma/client";
// @ts-ignore
import { StatusCodes } from "http-status-codes";
import request from "supertest";
import app from "../../../src/app";
import { createUserAndToken } from "../../fixture";
import { prisma } from "../../../src/database";

describe("Add Recipe to Cookbook", () => {
  let user: User;
  let bearerToken: string;

  beforeEach(async () => {
    const userAndToken = await createUserAndToken();
    user = userAndToken[0];
    bearerToken = userAndToken[1];
  });

  it("should allow a recipe to be attached to a cookbook", async () => {
    const recipe = await prisma.recipe.create({
      data: {
        name: "test recipe",
        user_id: user.id,
      }
    });

    const cookbook = await prisma.cookBook.create({
      data: {
        name: "test cookbook",
        user_id: user.id,
      }
    });

    const response = await request(app)
      .post("/cookbook/recipe/add")
      .send({
        "recipe_id": recipe.id,
        "cookbook_id": cookbook.id,
      })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toEqual(StatusCodes.CREATED);
    
    const attachments = await prisma.recipeCookBookAttachment.findMany({
      where: {
        recipe_id: recipe.id,
        cookbook_id: cookbook.id,
      }
    });

    expect(attachments.length).toEqual(1);
  });

  it("should allow another users public recipe to be attached to a cookbook", async () => {
    const [otherUser] = await createUserAndToken("otheruser@recipiece.org");
    const otherRecipe = await prisma.recipe.create({
      data: {
        name: "other users recipe",
        user_id: otherUser.id,
        private: false,
      }
    });

    const cookbook = await prisma.cookBook.create({
      data: {
        name: "test cookbook",
        user_id: user.id,
      }
    });

    const response = await request(app)
      .post("/cookbook/recipe/add")
      .send({
        "recipe_id": otherRecipe.id,
        "cookbook_id": cookbook.id,
      })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`);

      expect(response.statusCode).toEqual(StatusCodes.CREATED);
    
      const attachments = await prisma.recipeCookBookAttachment.findMany({
        where: {
          recipe_id: otherRecipe.id,
          cookbook_id: cookbook.id,
        }
      });

      expect(attachments.length).toEqual(1);
  });

  it("should not allow another users private recipe to be attached to a cookbook", async () => {
    const [otherUser] = await createUserAndToken("otheruser@recipiece.org");
    const otherRecipe = await prisma.recipe.create({
      data: {
        name: "other users recipe",
        user_id: otherUser.id,
        private: true,
      }
    });

    const cookbook = await prisma.cookBook.create({
      data: {
        name: "test cookbook",
        user_id: user.id,
      }
    });

    const response = await request(app)
      .post("/cookbook/recipe/add")
      .send({
        "recipe_id": otherRecipe.id,
        "cookbook_id": cookbook.id,
      })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`);

      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
    
      const attachments = await prisma.recipeCookBookAttachment.findMany({
        where: {
          recipe_id: otherRecipe.id,
          cookbook_id: cookbook.id,
        }
      });

      expect(attachments.length).toEqual(0);
  });

  it("should not allow duplicate attachments in the same cookbook", async () => {
    const recipe = await prisma.recipe.create({
      data: {
        name: "test recipe",
        user_id: user.id,
      }
    });

    const cookbook = await prisma.cookBook.create({
      data: {
        name: "test cookbook",
        user_id: user.id,
      }
    });

    await prisma.recipeCookBookAttachment.create({
      data: {
        recipe_id: recipe.id,
        cookbook_id: cookbook.id,
      }
    });

    const response = await request(app)
      .post("/cookbook/recipe/add")
      .send({
        "recipe_id": recipe.id,
        "cookbook_id": cookbook.id,
      })
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toEqual(StatusCodes.CONFLICT);
  });
});