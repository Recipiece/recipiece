import { FC } from "react";
import { useListShoppingListsQuery } from "../../api";
import { Button, LoadingGroup } from "../../component";
import { ShoppingList } from "../../data";
import { useResponsiveDialogComponents } from "../../hooks";
import { BaseDialogProps } from "../BaseDialogProps";

export const MobileListShoppingListsDialog: FC<BaseDialogProps<ShoppingList>> = ({ onSubmit }) => {
  const { ResponsiveContent, ResponsiveHeader, ResponsiveDescription, ResponsiveTitle } = useResponsiveDialogComponents();
  const { data: shoppingLists, isLoading: isLoadingShoppingLists } = useListShoppingListsQuery({
    page_number: 0,
  });

  return (
    <ResponsiveContent className="p-6">
      <ResponsiveHeader>
        <ResponsiveTitle>Shopping Lists</ResponsiveTitle>
        <ResponsiveDescription>Go to...</ResponsiveDescription>
      </ResponsiveHeader>
      <div className="grid grid-cols-1 gap-2 p-2 overflow-scroll">
        <LoadingGroup variant="spinner" isLoading={isLoadingShoppingLists}>
          {(shoppingLists?.data || []).map((list) => {
            return (
              <Button key={list.id} variant="link" onClick={() => onSubmit?.(list)}>
                {list.name}
              </Button>
            );
          })}
        </LoadingGroup>
      </div>
    </ResponsiveContent>
  );
};
