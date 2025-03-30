import { RecipeSchema } from "@recipiece/types";
import { CSSProperties } from "react";
import { StorageKeys } from "../util";
import { useLocalStorage } from "./usehooks";

export const useGetRecipeImageBackgroundStyle = (recipe: RecipeSchema | undefined) => {
  const [selectedTheme] = useLocalStorage(StorageKeys.UI_THEME, "system");
  const recipeImageUrl = recipe?.image_url ?? recipe?.external_image_url;

  let newBgcolor: string;
  const systemWantsDark = selectedTheme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches;
  const isDarkMode = selectedTheme === "dark" || systemWantsDark;

  if (isDarkMode) {
    newBgcolor = "rgba(0, 0, 0, 0.8)";
  } else {
    newBgcolor = "rgba(255,255,255,0.8)";
  }

  const baseStyles: CSSProperties = {
    backgroundImage: `url(${recipeImageUrl})`,
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    backgroundPositionX: "center",
  };

  const textSafeStyles: CSSProperties = {
    ...baseStyles,
    backgroundColor: newBgcolor,
    backgroundBlendMode: "overlay",
  };

  return { imageUrl: recipeImageUrl, textSafeStyles, baseStyles };
};
