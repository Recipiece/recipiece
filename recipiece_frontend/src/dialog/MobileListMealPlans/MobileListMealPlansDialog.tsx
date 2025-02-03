import { ListMealPlansQuerySchema, MealPlanSchema } from "@recipiece/types";
import { FC, useMemo } from "react";
import { useListMealPlansQuery } from "../../api";
import { Button, LoadingGroup, SharedAvatar } from "../../component";
import { useResponsiveDialogComponents } from "../../hooks";
import { BaseDialogProps } from "../BaseDialogProps";

const MealPlanDisplay: FC<{ readonly mealPlan: MealPlanSchema }> = ({ mealPlan }) => {
  const membershipId = mealPlan.shares?.[0]?.user_kitchen_membership_id;

  return (
    <div className="flex flex-row items-center gap-2">
      {membershipId && <SharedAvatar size="small" userKitchenMembershipId={membershipId}></SharedAvatar>}
      {mealPlan.name}
    </div>
  );
};

export const MobileListMealPlansDialog: FC<BaseDialogProps<MealPlanSchema>> = ({ onSubmit }) => {
  const { ResponsiveContent, ResponsiveHeader, ResponsiveTitle } = useResponsiveDialogComponents();

  const queryFilters: ListMealPlansQuerySchema = useMemo(() => {
    return {
      page_number: 0,
    };
  }, []);

  const { data: mealPlans, isLoading: isLoadingMealPlans } = useListMealPlansQuery({
    ...queryFilters,
  });

  return (
    <ResponsiveContent className="p-6">
      <ResponsiveHeader>
        <ResponsiveTitle>Meal Plans</ResponsiveTitle>
      </ResponsiveHeader>

      <LoadingGroup variant="spinner" isLoading={isLoadingMealPlans}>
        <div className="grid grid-cols-1 gap-2 overflow-scroll p-2">
          {(mealPlans?.data || []).map((mealPlan) => {
            return (
              <Button key={mealPlan.id} variant="outline" onClick={() => onSubmit?.(mealPlan)}>
                <MealPlanDisplay mealPlan={mealPlan} />
              </Button>
            );
          })}
        </div>
      </LoadingGroup>
    </ResponsiveContent>
  );
};
