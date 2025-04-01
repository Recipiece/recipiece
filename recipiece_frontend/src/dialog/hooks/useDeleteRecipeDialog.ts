import { RecipeSchema } from "@recipiece/types";
import { useCallback, useContext } from "react";
import { useDeleteRecipeMutation } from "../../api";
import { useToast } from "../../component";
import { DialogContext } from "../../context";

export const useDeleteRecipeDialog = (recipe: RecipeSchema) => {
  const { toast } = useToast();
  const { pushDialog, popDialog } = useContext(DialogContext);

  const { mutateAsync: deleteRecipe } = useDeleteRecipeMutation();

  const onDeleteRecipe = useCallback(async () => {
    pushDialog("deleteRecipe", {
      onSubmit: async (recipe: RecipeSchema) => {
        try {
          await deleteRecipe(recipe);
          toast({
            title: "Recipe successfully deleted",
            variant: "default",
          });
        } catch {
          toast({
            title: "Cannot delete recipe",
            description: "There was an issue trying to delete your recipe. Try again later.",
            variant: "destructive",
          });
        } finally {
          popDialog("deleteRecipe");
        }
      },
      onClose: () => popDialog("deleteRecipe"),
      recipe: recipe,
    });
  }, [pushDialog, recipe, deleteRecipe, toast, popDialog]);

  return { onDeleteRecipe };
};
