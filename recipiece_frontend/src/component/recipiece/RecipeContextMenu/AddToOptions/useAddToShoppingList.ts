import { RecipeSchema, ShoppingListSchema } from "@recipiece/types";
import { useContext } from "react";
import { useAppendShoppingListItemsMutation } from "../../../../api";
import { DialogContext } from "../../../../context";
import { AddRecipeToShoppingListForm } from "../../../../dialog";
import { useLayout } from "../../../../hooks";
import { useToast } from "../../../shadcn";

export const useAddToShoppingListModalMadness = (recipe: RecipeSchema) => {
  const { pushDialog, popDialog } = useContext(DialogContext);
  const { isMobile } = useLayout();
  const { toast } = useToast();

  const { mutateAsync: appendToShoppingList } = useAppendShoppingListItemsMutation();

  const mobileOnAddToShoppingList = () => {
    pushDialog("mobileShoppingLists", {
      onClose: () => popDialog("mobileShoppingLists"),
      onSubmit: (shoppingList: ShoppingListSchema) => {
        popDialog("mobileShoppingLists");
        onAddToShoppingList(shoppingList);
      },
    });
  };

  const onAddToShoppingList = (shoppingList: ShoppingListSchema) => {
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
              shopping_list_id: shoppingList.id,
              items: itemsToAdd,
            });
            toast({
              title: "Shopping List Updated",
              description: `The ingredients were added to ${shoppingList.name}`,
              variant: "default",
            });
          } catch {
            toast({
              title: "Error Adding Ingredients",
              description: `There was an issue adding the ingredients to ${shoppingList.name}. Try again later.`,
              variant: "destructive",
            });
          }
        }
        popDialog("addRecipeToShoppingList");
      },
      recipe: recipe,
    });
  };

  const addToShoppingList = (shoppingList?: ShoppingListSchema) => {
    if (isMobile) {
      mobileOnAddToShoppingList();
    } else {
      onAddToShoppingList(shoppingList!);
    }
  };

  return {
    addToShoppingList,
  };
};
