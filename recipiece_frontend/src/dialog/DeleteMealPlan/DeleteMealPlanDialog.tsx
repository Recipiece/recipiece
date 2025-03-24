import { MealPlanSchema } from "@recipiece/types";
import { FC } from "react";
import { Button } from "../../component";
import { useResponsiveDialogComponents } from "../../hooks";
import { BaseDialogProps } from "../BaseDialogProps";

export interface DeleteMealPlanDialogProps extends BaseDialogProps<MealPlanSchema> {
  readonly mealPlan: MealPlanSchema;
}

export const DeleteMealPlanDialog: FC<DeleteMealPlanDialogProps> = ({ mealPlan, onClose, onSubmit }) => {
  const { ResponsiveContent, ResponsiveHeader, ResponsiveDescription, ResponsiveFooter, ResponsiveTitle } = useResponsiveDialogComponents();

  return (
    <ResponsiveContent className="p-6">
      <ResponsiveHeader>
        <ResponsiveTitle>Delete {mealPlan.name}?</ResponsiveTitle>
        <ResponsiveDescription>
          Click the Delete Meal Plan button below to permanently delete <i>{mealPlan.name}</i>. This action is permanent and cannot be undone!
        </ResponsiveDescription>
      </ResponsiveHeader>
      <ResponsiveFooter className="flex-col-reverse">
        <Button variant="outline" onClick={() => onClose?.()}>
          Cancel
        </Button>
        <Button variant="destructive" onClick={() => onSubmit?.(mealPlan)}>
          Delete Meal Plan
        </Button>
      </ResponsiveFooter>
    </ResponsiveContent>
  );
};
