import { zodResolver } from "@hookform/resolvers/zod";
import { MealPlanSchema } from "@recipiece/types";
import { FC, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button, Form, FormInput, Stack, SubmitButton } from "../../component";
import { useResponsiveDialogComponents } from "../../hooks";
import { BaseDialogProps } from "../BaseDialogProps";

export interface ModifyMealPlanDialogProps extends BaseDialogProps<ModifyMealPlanForm> {
  readonly mealPlan?: MealPlanSchema;
}

const ModifyMealPlanFormSchema = z.object({
  name: z.string().max(50).min(1, "A name is required"),
});

export type ModifyMealPlanForm = z.infer<typeof ModifyMealPlanFormSchema>;

export const ModifyMealPlanDialog: FC<ModifyMealPlanDialogProps> = ({ onSubmit, onClose, mealPlan }) => {
  const { ResponsiveContent, ResponsiveHeader, ResponsiveDescription, ResponsiveTitle, ResponsiveFooter } = useResponsiveDialogComponents();

  const isEditing = !!mealPlan;

  const defaultValues: ModifyMealPlanForm = useMemo(() => {
    if (mealPlan) {
      return {
        name: mealPlan.name,
      };
    } else {
      return {
        name: "",
      };
    }
  }, [mealPlan]);

  const form = useForm<ModifyMealPlanForm>({
    resolver: zodResolver(ModifyMealPlanFormSchema),
    defaultValues: { ...defaultValues },
  });

  const { isSubmitting } = form.formState;

  const onModifyMealPlan = useCallback(
    (data: ModifyMealPlanForm) => {
      onSubmit?.(data);
    },
    [onSubmit]
  );

  return (
    <ResponsiveContent className="p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onModifyMealPlan)}>
          <ResponsiveHeader className="mb-4">
            <ResponsiveTitle>{isEditing ? "Edit" : "Create"} Meal Plan</ResponsiveTitle>
            <ResponsiveDescription>Configure a meal plan.</ResponsiveDescription>
          </ResponsiveHeader>

          <Stack>
            <FormInput required placeholder="What do you want to call your meal plan?" name="name" type="text" label="Name" />
          </Stack>

          <ResponsiveFooter className="mt-4 flex-col-reverse">
            <Button disabled={isSubmitting} type="button" variant="outline" onClick={() => onClose?.()}>
              Cancel
            </Button>
            <SubmitButton>Save Meal Plan</SubmitButton>
          </ResponsiveFooter>
        </form>
      </Form>
    </ResponsiveContent>
  );
};
