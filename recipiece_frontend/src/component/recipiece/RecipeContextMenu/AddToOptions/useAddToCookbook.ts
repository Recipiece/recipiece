import { CookbookSchema, RecipeSchema } from "@recipiece/types";
import { useContext } from "react";
import { useAttachRecipeToCookbookMutation } from "../../../../api";
import { DialogContext } from "../../../../context";
import { useLayout } from "../../../../hooks";
import { useToast } from "../../../shadcn";

export const useAddToCookbookModalMadness = (recipe: RecipeSchema) => {
  const { pushDialog, popDialog } = useContext(DialogContext);
  const { isMobile } = useLayout();
  const { toast } = useToast();

  const { mutateAsync: addRecipeToCookbook } = useAttachRecipeToCookbookMutation();

  const addToCookbook = (cookbook?: CookbookSchema) => {
    if (isMobile) {
      mobileAdd();
    } else {
      onAddToCookbook(cookbook!);
    }
  };

  const onAddToCookbook = async (cookbook: CookbookSchema) => {
    try {
      await addRecipeToCookbook({
        recipe: recipe,
        cookbook: cookbook,
      });
      toast({
        title: "Recipe Added",
        description: "The recipe was added to your cookbook.",
      });
    } catch {
      toast({
        title: "Cannot add recipe to cookbook",
        description: "There was an issue trying to add your recipe to this cookbook. Try again later.",
        variant: "destructive",
      });
    }
  };

  const mobileAdd = () => {
    pushDialog("mobileCookbooks", {
      excludeContainingRecipeId: recipe.id,
      onClose: () => popDialog("mobileCookbooks"),
      onSubmit: async (cookbook: CookbookSchema) => {
        await onAddToCookbook(cookbook);
        popDialog("mobileCookbooks");
      },
    });
  };

  return { addToCookbook };
};
