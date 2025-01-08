import { ComponentProps, FC } from "react";
import { ShoppingList } from "../../../data";
import { MenubarItem } from "../../shadcn";
import { SharedAvatar } from "../SharedAvatar";

export const ShoppingListMenuItem: FC<{ readonly shoppingList: ShoppingList } & ComponentProps<typeof MenubarItem>> = ({ shoppingList, ...restProps }) => {
  const membershipId = shoppingList.shares?.[0]?.user_kitchen_membership_id;

  return (
    <MenubarItem {...restProps}>
      <div className="flex flex-row gap-2 items-center">
      {membershipId && <SharedAvatar size="small" userKitchenMembershipId={membershipId}></SharedAvatar>}
      {shoppingList.name}
      </div>
    </MenubarItem>
  );
};
