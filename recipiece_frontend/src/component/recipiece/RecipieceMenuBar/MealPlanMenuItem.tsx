import { MealPlanSchema } from "@recipiece/types";
import { ComponentProps, FC } from "react";
import { MenubarItem } from "../../shadcn";
import { MembershipAvatar } from "../MembershipAvatar";

export const MealPlanMenuItem: FC<{ readonly mealPlan: MealPlanSchema } & ComponentProps<typeof MenubarItem>> = ({
  mealPlan,
  ...restProps
}) => {
  const membershipId = mealPlan.shares?.[0]?.user_kitchen_membership_id;

  return (
    <MenubarItem {...restProps}>
      <div className="flex flex-row items-center gap-2">
        <MembershipAvatar size="small" membershipId={membershipId} />
        {mealPlan.name}
      </div>
    </MenubarItem>
  );
};
