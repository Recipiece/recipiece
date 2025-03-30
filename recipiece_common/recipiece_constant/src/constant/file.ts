import { v4 } from "uuid";

export class RecipeImage {
  // max of 10 MB
  public static readonly MAX_FILE_SIZE_BYTES = 1000000 * 10;
  public static readonly ALLOWED_EXTENSIONS = ["png", "webp", "jpg", "jpeg", "svg"];

  public static readonly keyFor = (userId: number, recipeId: number): string => {
    const hash = v4();
    return `user${userId}/recipes/${hash}_${recipeId}`;
  }
}
