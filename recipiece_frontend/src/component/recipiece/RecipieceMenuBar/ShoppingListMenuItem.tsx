import { ShoppingListSchema } from "@recipiece/types";
import { ComponentProps, FC } from "react";
import { MenubarItem } from "../../shadcn";
import { SharedAvatar } from "../SharedAvatar";

export const ShoppingListMenuItem: FC<
  { readonly shoppingList: ShoppingListSchema } & ComponentProps<typeof MenubarItem>
> = ({ shoppingList, ...restProps }) => {
  const membershipId = shoppingList.shares?.[0]?.user_kitchen_membership_id;

  return (
    <MenubarItem {...restProps}>
      <div className="flex flex-row items-center gap-2">
        {membershipId && <SharedAvatar size="small" userKitchenMembershipId={membershipId}></SharedAvatar>}
        {shoppingList.name}
      </div>
    </MenubarItem>
  );
};
