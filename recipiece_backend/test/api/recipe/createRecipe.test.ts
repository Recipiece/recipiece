import { prisma, User } from "@recipiece/database";
import { generateUserTag, tagGenerator } from "@recipiece/test";
import { CreateRecipeRequestSchema, RecipeSchema } from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import request from "supertest";

describe("Create Recipe", () => {
  let user: User;
  let bearerToken: string;

  beforeEach(async () => {
    [user, bearerToken] = await fixtures.createUserAndToken();
  });

  it("should allow a recipe to be created with ingredients and steps", async () => {
    const expectedBody = {
      name: "My Test Recipe",
      description: "A cool recipe",
      steps: [
        {
          content: "hello world",
          order: 0,
        },
      ],
      ingredients: [
        {
          name: "asdfqwer",
          unit: "1",
          order: 0,
        },
      ],
    };

    const response = await request(server)
      .post("/recipe")
      .send(expectedBody)
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toEqual(StatusCodes.OK);
    const responseBody = response.body;

    expect(responseBody.id).toBeTruthy();
    expect(responseBody.name).toEqual(expectedBody.name);
    expect(responseBody.user_id).toEqual(user.id);

    const ingredients = responseBody.ingredients;
    expect(ingredients.length).toEqual(1);
    expect(ingredients[0].recipe_id).toEqual(responseBody.id);

    const steps = responseBody.steps;
    expect(steps.length).toEqual(1);
    expect(steps[0].recipe_id).toEqual(responseBody.id);
  });

  it("should attach the provided user tags", async () => {
    const existingTagToAttach = await generateUserTag({ user_id: user.id, content: tagGenerator.next().value });
    // generate an extra one just to make some noise
    const extraTag = await generateUserTag({ user_id: user.id, content: tagGenerator.next().value });
    const newTagContent = [tagGenerator.next().value, tagGenerator.next().value].join(" ");

    const expectedBody = <CreateRecipeRequestSchema>{
      name: "My Test Recipe",
      description: "A cool recipe",
      steps: [
        {
          content: "hello world",
          order: 0,
        },
      ],
      ingredients: [
        {
          name: "asdfqwer",
          unit: "1",
          order: 0,
        },
      ],
      tags: [newTagContent.toUpperCase(), `  ${existingTagToAttach.content}  `],
    };

    const response = await request(server)
      .post("/recipe")
      .send(expectedBody)
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${bearerToken}`);

    expect(response.statusCode).toBe(StatusCodes.OK);
    const createdRecipeResponse = <RecipeSchema>response.body;

    // the body should have the tags on it
    expect(createdRecipeResponse.tags).toBeTruthy();
    expect(createdRecipeResponse.tags!.length).toBe(2);
    const createdResponseTagContents = createdRecipeResponse.tags!.map((t) => t.content);
    expect(createdResponseTagContents.includes(newTagContent.toLowerCase().trim())).toBeTruthy();
    expect(createdResponseTagContents.includes(existingTagToAttach.content.toLowerCase().trim())).toBeTruthy();

    // the new tag should have been created and attached
    const newTagEntity = await prisma.userTag.findFirst({
      where: {
        user_id: user.id,
        content: newTagContent.toLowerCase().trim(),
      },
    });
    expect(newTagEntity).toBeTruthy();

    const newTagAttachment = await prisma.recipeTagAttachment.findFirst({
      where: {
        user_tag_id: newTagEntity!.id,
        recipe_id: createdRecipeResponse.id,
      },
    });
    expect(newTagAttachment).toBeTruthy();

    // the existing tag that was passed in should have also been attached
    const existingTagAttachment = await prisma.recipeTagAttachment.findFirst({
      where: {
        user_tag_id: existingTagToAttach.id,
        recipe_id: createdRecipeResponse.id,
      },
    });
    expect(existingTagAttachment).toBeTruthy();

    // the extra tag should not have been attach
    const extraTagAttachment = await prisma.recipeTagAttachment.findFirst({
      where: {
        user_tag_id: extraTag.id,
        recipe_id: createdRecipeResponse.id,
      },
    });
    expect(extraTagAttachment).toBeFalsy();
  });
});
