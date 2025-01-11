import { useCallback, useContext } from "react";
import { Recipe } from "../../data";
import { DialogContext } from "../../context";
import { useDeleteRecipeMutation } from "../../api";
import { useToast } from "../../component";

export const useDeleteRecipeDialog = (recipe: Recipe) => {
  const { toast } = useToast();
  const { pushDialog, popDialog } = useContext(DialogContext);

  const { mutateAsync: deleteRecipe } = useDeleteRecipeMutation();

  const onDeleteRecipe = useCallback(async () => {
    pushDialog("deleteRecipe", {
      onSubmit: async (recipe: Recipe) => {
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
