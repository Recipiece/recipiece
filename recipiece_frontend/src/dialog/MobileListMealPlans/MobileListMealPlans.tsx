import { ListMealPlansQuerySchema, MealPlanSchema } from "@recipiece/types";
import { FC, useMemo } from "react";
import { useListMealPlansQuery } from "../../api";
import { Button, LoadingGroup } from "../../component";
import { useResponsiveDialogComponents } from "../../hooks";
import { BaseDialogProps } from "../BaseDialogProps";

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
      <div className="grid grid-cols-1 gap-2 p-2 overflow-scroll">
        <LoadingGroup variant="spinner" isLoading={isLoadingMealPlans}>
          {(mealPlans?.data || []).map((mealPlan) => {
            return (
              <Button key={mealPlan.id} variant="link" onClick={() => onSubmit?.(mealPlan)}>
                {mealPlan.name}
              </Button>
            );
          })}
        </LoadingGroup>
      </div>
    </ResponsiveContent>
  );
};
