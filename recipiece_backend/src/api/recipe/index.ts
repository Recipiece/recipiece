import { Constant } from "@recipiece/constant";
import {
  YCreateRecipeRequestSchema,
  YForkRecipeRequestSchema,
  YListRecipesQuerySchema,
  YListRecipesResponseSchema,
  YParseRecipeFromURLRequestSchema,
  YParseRecipeFromURLResponseSchema,
  YRecipeSchema,
  YSetRecipeImageResponseSchema,
  YUpdateRecipeRequestSchema,
} from "@recipiece/types";
import { NextFunction, Request, Response } from "express";
import multer from "multer";
import { Route } from "../../types";
import { BadRequestError, ContentTooLargeError } from "../../util/error";
import { createRecipe } from "./createRecipe";
import { deleteRecipe } from "./deleteRecipe";
import { forkRecipe } from "./forkRecipe";
import { getRecipe } from "./getRecipe";
import { listRecipes } from "./listRecipes";
import { parseRecipeFromUrl } from "./parseFromUrl";
import { setRecipeImage } from "./setRecipeImage";
import { updateRecipe } from "./updateRecipe";

const setImageMulterMiddleware = multer({
  storage: multer.memoryStorage(),
});

const setImageSanitizeMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const file: Express.Multer.File | undefined = req.file;

  if (!file) {
    throw new BadRequestError("Must supply a file");
  }

  if (file.size > Constant.RecipeImage.MAX_FILE_SIZE_BYTES) {
    throw new ContentTooLargeError(`File exceeds max size limit of ${Constant.RecipeImage.MAX_FILE_SIZE_BYTES} bytes`);
  }

  const fileExtension = file.originalname.split(".").pop();
  if (!fileExtension || !Constant.RecipeImage.ALLOWED_EXTENSIONS.includes(fileExtension)) {
    throw new BadRequestError(`Unsupported extension ${fileExtension}`);
  }

  next();
};

export const RECIPE_ROUTES: Route[] = [
  {
    path: "/recipe",
    authentication: "access_token",
    method: "POST",
    function: createRecipe,
    requestSchema: YCreateRecipeRequestSchema,
    responseSchema: YRecipeSchema,
  },
  {
    path: "/recipe",
    authentication: "access_token",
    method: "PUT",
    function: updateRecipe,
    requestSchema: YUpdateRecipeRequestSchema,
    responseSchema: YRecipeSchema,
  },
  {
    path: "/recipe/parse/url",
    authentication: "access_token",
    method: "POST",
    function: parseRecipeFromUrl,
    requestSchema: YParseRecipeFromURLRequestSchema,
    responseSchema: YParseRecipeFromURLResponseSchema,
  },
  {
    path: "/recipe/list",
    authentication: "access_token",
    method: "GET",
    function: listRecipes,
    requestSchema: YListRecipesQuerySchema,
    responseSchema: YListRecipesResponseSchema,
  },
  {
    path: "/recipe/:id(\\d+)",
    authentication: "access_token",
    method: "GET",
    function: getRecipe,
    responseSchema: YRecipeSchema,
  },
  {
    path: "/recipe/:id(\\d+)",
    authentication: "access_token",
    method: "DELETE",
    function: deleteRecipe,
  },
  {
    path: "/recipe/fork",
    authentication: "access_token",
    method: "POST",
    function: forkRecipe,
    requestSchema: YForkRecipeRequestSchema,
    responseSchema: YRecipeSchema,
  },
  {
    path: "/recipe/image",
    method: "POST",
    authentication: "access_token",
    function: setRecipeImage,
    preMiddleware: [setImageMulterMiddleware.single("file"), setImageSanitizeMiddleware],
    responseSchema: YSetRecipeImageResponseSchema,
  },
];
