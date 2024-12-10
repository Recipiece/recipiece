import { useCallback, useContext } from "react";
import { Recipe } from "../../data";
import { DialogContext } from "../../context";
import { useDeleteRecipeMutation } from "../../api";
import { useToast } from "../../component";

export const useDeleteRecipeDialog = (recipe: Recipe) => {
  const { toast } = useToast();
  const { pushDialog, popDialog } = useContext(DialogContext);

  const { mutateAsync: deleteRecipe } = useDeleteRecipeMutation({
    onSuccess: () => {
      toast({
        title: "Recipe successfully deleted",
        variant: "default",
      });
    },
    onFailure: () => {
      toast({
        title: "Cannot delete recipe",
        description: "There was an issue trying to delete your recipe. Try again later.",
        variant: "destructive",
      });
    },
  });

  const onDeleteRecipe = useCallback(async () => {
    pushDialog("deleteRecipe", {
      onSubmit: async (recipe: Recipe) => {
        try {
          await deleteRecipe(recipe.id);
        } catch {
          // noop
        } finally {
          popDialog("deleteRecipe");
        }
      },
      onClose: () => popDialog("deleteRecipe"),
      recipe: recipe,
    });
  }, [pushDialog, popDialog, recipe, deleteRecipe]);

  return { onDeleteRecipe };
};
