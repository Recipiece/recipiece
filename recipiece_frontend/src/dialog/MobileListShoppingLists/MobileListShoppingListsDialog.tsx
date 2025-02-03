import { ShoppingListSchema } from "@recipiece/types";
import { FC } from "react";
import { useListShoppingListsQuery } from "../../api";
import { Button, LoadingGroup, SharedAvatar } from "../../component";
import { useResponsiveDialogComponents } from "../../hooks";
import { BaseDialogProps } from "../BaseDialogProps";

const ShoppingListDisplay: FC<{ readonly shoppingList: ShoppingListSchema }> = ({ shoppingList }) => {
  const membershipId = shoppingList.shares?.[0]?.user_kitchen_membership_id;

  return (
    <div className="flex flex-row items-center gap-2">
      {membershipId && <SharedAvatar size="small" userKitchenMembershipId={membershipId}></SharedAvatar>}
      {shoppingList.name}
    </div>
  );
};

export const MobileListShoppingListsDialog: FC<BaseDialogProps<ShoppingListSchema>> = ({ onSubmit }) => {
  const { ResponsiveContent, ResponsiveHeader, ResponsiveTitle } = useResponsiveDialogComponents();
  const { data: shoppingLists, isLoading: isLoadingShoppingLists } = useListShoppingListsQuery({
    page_number: 0,
  });

  return (
    <ResponsiveContent className="p-6">
      <ResponsiveHeader>
        <ResponsiveTitle>Shopping Lists</ResponsiveTitle>
      </ResponsiveHeader>
      <div className="grid grid-cols-1 gap-2 overflow-scroll p-2">
        <LoadingGroup variant="spinner" isLoading={isLoadingShoppingLists}>
          {(shoppingLists?.data || []).map((list) => {
            return (
              <Button key={list.id} variant="outline" onClick={() => onSubmit?.(list)}>
                <ShoppingListDisplay shoppingList={list} />
              </Button>
            );
          })}
        </LoadingGroup>
      </div>
    </ResponsiveContent>
  );
};
