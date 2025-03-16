import { ShoppingListSchema } from "@recipiece/types";
import { ComponentProps, FC } from "react";
import { MenubarItem } from "../../shadcn";
import { MembershipAvatar } from "../MembershipAvatar";

export const ShoppingListMenuItem: FC<
  { readonly shoppingList: ShoppingListSchema } & ComponentProps<typeof MenubarItem>
> = ({ shoppingList, ...restProps }) => {
  const membershipId = shoppingList.shares?.[0]?.user_kitchen_membership_id;

  return (
    <MenubarItem {...restProps}>
      <div className="flex flex-row items-center gap-2">
        {membershipId && <MembershipAvatar size="small" membershipId={membershipId} />}
        {shoppingList.name}
      </div>
    </MenubarItem>
  );
};
