import { MealPlanSchema } from "@recipiece/types";
import { ComponentProps, FC } from "react";
import { MenubarItem } from "../../shadcn";
import { SharedAvatar } from "../SharedAvatar";

export const MealPlanMenuItem: FC<{ readonly mealPlan: MealPlanSchema } & ComponentProps<typeof MenubarItem>> = ({ mealPlan, ...restProps }) => {
  const membershipId = mealPlan.shares?.[0]?.user_kitchen_membership_id;

  return (
    <MenubarItem {...restProps}>
      <div className="flex flex-row items-center gap-2">
        {membershipId && <SharedAvatar size="small" userKitchenMembershipId={membershipId}></SharedAvatar>}
        {mealPlan.name}
      </div>
    </MenubarItem>
  );
};
