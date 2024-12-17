import { FC, useCallback, useMemo } from "react";
import { BaseDialogProps } from "../BaseDialogProps";
import { MealPlan } from "../../data";
import { z } from "zod";
import { Duration } from "luxon";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useResponsiveDialogComponents } from "../../hooks";
import { Button, Form, FormInput, FormSelect, SelectItem, Stack, SubmitButton } from "../../component";

export interface ModifyMealPlanDialogProps extends BaseDialogProps<ModifyMealPlanForm> {
  readonly mealPlan?: MealPlan;
}

const ModifyMealPlanFormSchema = z.object({
  name: z.string().max(50).min(1, "A name is required"),
  duration: z.string().duration(),
});

export type ModifyMealPlanForm = z.infer<typeof ModifyMealPlanFormSchema>;

export const ModifyMealPlanDialog: FC<ModifyMealPlanDialogProps> = ({ onSubmit, onClose, mealPlan }) => {
  const { ResponsiveContent, ResponsiveHeader, ResponsiveDescription, ResponsiveTitle, ResponsiveFooter } = useResponsiveDialogComponents();

  const isEditing = !!mealPlan;

  const defaultValues: ModifyMealPlanForm = useMemo(() => {
    if (mealPlan) {
      return {
        name: mealPlan.name,
        duration: mealPlan.duration,
      };
    } else {
      return {
        name: "",
        duration: Duration.fromObject({ days: 1 }).toISO(),
      };
    }
  }, [mealPlan]);

  const form = useForm<ModifyMealPlanForm>({
    resolver: zodResolver(ModifyMealPlanFormSchema),
    defaultValues: { ...defaultValues },
  });

  const { isSubmitting } = form.formState;

  const onModifyMealPlan = useCallback((data: ModifyMealPlanForm) => {
    onSubmit?.(data);
  }, [onSubmit]);

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
            <FormSelect name="duration" label="Duration" instructions="How many days does this meal plan last?">
              <SelectItem value={Duration.fromObject({days: 1}).toISO()}>1 Day</SelectItem>
              <SelectItem value={Duration.fromObject({days: 2}).toISO()}>2 Days</SelectItem>
              <SelectItem value={Duration.fromObject({days: 3}).toISO()}>3 Days</SelectItem>
              <SelectItem value={Duration.fromObject({days: 4}).toISO()}>4 Days</SelectItem>
              <SelectItem value={Duration.fromObject({days: 5}).toISO()}>5 Days</SelectItem>
              <SelectItem value={Duration.fromObject({days: 6}).toISO()}>6 Days</SelectItem>
              <SelectItem value={Duration.fromObject({weeks: 1}).toISO()}>1 Week</SelectItem>
              <SelectItem value={Duration.fromObject({weeks: 2}).toISO()}>2 Weeks</SelectItem>
              <SelectItem value={Duration.fromObject({months: 1}).toISO()}>1 Month</SelectItem>
            </FormSelect>
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
