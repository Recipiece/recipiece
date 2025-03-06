import { CookbookSchema } from "@recipiece/types";
import { ComponentProps, FC } from "react";
import { MenubarItem } from "../../shadcn";
import { SharedAvatar } from "../SharedAvatar";

export const CookbookMenuItem: FC<{ readonly cookbook: CookbookSchema } & ComponentProps<typeof MenubarItem>> = ({
  cookbook,
  ...restProps
}) => {
  const membershipId = cookbook.shares?.[0]?.user_kitchen_membership_id;

  return (
    <MenubarItem {...restProps}>
      <div className="flex flex-row items-center gap-2">
        {membershipId && <SharedAvatar size="small" userKitchenMembershipId={membershipId}></SharedAvatar>}
        {cookbook.name}
      </div>
    </MenubarItem>
  );
};
