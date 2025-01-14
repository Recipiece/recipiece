import { useCallback, useContext } from "react";
import { DialogContext } from "../../context";
import { AddRecipeToShoppingListForm } from "../AddRecipeToShoppingList";
import { useToast } from "../../component";
import { useAppendShoppingListItemsMutation } from "../../api";
import { Recipe } from "../../data";

export const useAddRecipeToShoppingListDialog = (recipe: Recipe) => {
  const { pushDialog, popDialog } = useContext(DialogContext);
  const { toast } = useToast();

  const { mutateAsync: appendToShoppingList } = useAppendShoppingListItemsMutation();

  const onAddToShoppingList = useCallback(
    async (listId: number) => {
      pushDialog("addRecipeToShoppingList", {
        onClose: () => popDialog("addRecipeToShoppingList"),
        onSubmit: async (formData: AddRecipeToShoppingListForm) => {
          const itemsToAdd = formData.items
            .filter((item) => item.selected)
            .map((item) => {
              return {
                content: item.name,
                notes: item.notes ?? "",
              };
            });
          if (itemsToAdd.length > 0) {
            try {
              await appendToShoppingList({
                shopping_list_id: listId,
                items: itemsToAdd,
              });
              toast({
                title: "Shopping List Updated",
                description: "The ingredients were added to you shopping list",
                variant: "default",
              });
            } catch {
              toast({
                title: "Error Adding Ingredients",
                description: "There was an issue adding the ingredients to the shopping list. Try again later.",
                variant: "destructive",
              });
            }
          }
          popDialog("addRecipeToShoppingList");
        },
        recipe: recipe,
      });
    },
    [pushDialog, recipe, popDialog, appendToShoppingList, toast]
  );

  return { onAddToShoppingList };
};
