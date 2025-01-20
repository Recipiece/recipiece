import { zodResolver } from "@hookform/resolvers/zod";
import { MealPlanItemSchema, MealPlanSchema } from "@recipiece/types";
import { FC, useCallback, useMemo } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { Button, Form, FormCheckbox, ScrollArea, SubmitButton } from "../../component";
import { useResponsiveDialogComponents } from "../../hooks";
import { BaseDialogProps } from "../BaseDialogProps";
import { DateTime } from "luxon";

export interface AddMealPlanToShoppingListDialogProps extends BaseDialogProps<AddMealPlanToShoppingListForm> {
  readonly mealPlan: MealPlanSchema;
  readonly mealPlanItems: MealPlanItemSchema[];
}

const AddMealPlanToShoppingListFormSchema = z.object({
  items: z.array(
    z.object({
      name: z.string(),
      notes: z.string(),
      selected: z.boolean(),
    })
  ),
});

export type AddMealPlanToShoppingListForm = z.infer<typeof AddMealPlanToShoppingListFormSchema>;

export const AddMealPlanToShoppingListDialog: FC<AddMealPlanToShoppingListDialogProps> = ({ onSubmit, onClose, mealPlan, mealPlanItems }) => {
  const { ResponsiveContent, ResponsiveHeader, ResponsiveDescription, ResponsiveTitle, ResponsiveFooter } = useResponsiveDialogComponents();

  const defaultValues: AddMealPlanToShoppingListForm = useMemo(() => {
    const items = mealPlanItems
      .filter((item) => !!item.recipe?.ingredients)
      .map((item) => {
        let notesString = item.label ? `${item.label} - ` : "";
        notesString += DateTime.fromJSDate(item.start_date).toFormat("EEE, MMM dd");
        notesString += ` - ${item.recipe!.name}`;
        return (item.recipe?.ingredients ?? []).map((ing) => {
          return {
            name: ing.name,
            selected: true,
            notes: notesString.trim(),
          };
        });
      })
      .flat();

    return { items: [...items] };
  }, [mealPlanItems]);

  const form = useForm<AddMealPlanToShoppingListForm>({
    resolver: zodResolver(AddMealPlanToShoppingListFormSchema),
    defaultValues: {
      ...defaultValues,
    },
  });

  const itemsFieldArray = useFieldArray({
    control: form.control,
    name: "items",
  });

  const onAddToShoppingList = useCallback(
    async (formData: AddMealPlanToShoppingListForm) => {
      onSubmit?.(formData);
    },
    [onSubmit]
  );

  const onSelectAll = useCallback(() => {
    form.reset({
      items: [
        ...defaultValues.items.map((item) => {
          return { ...item, selected: true };
        }),
      ],
    });
  }, [form, defaultValues]);

  const onDeselectAll = useCallback(() => {
    form.reset({
      items: [
        ...defaultValues.items.map((item) => {
          return { ...item, selected: false };
        }),
      ],
    });
  }, [form, defaultValues]);

  return (
    <ResponsiveContent className="p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onAddToShoppingList)}>
          <ResponsiveHeader className="mb-4">
            <ResponsiveTitle>Add {mealPlan.name} to your shopping list</ResponsiveTitle>
            <ResponsiveDescription>Add the ingredients from the recipes in {mealPlan.name} to your shopping list.</ResponsiveDescription>
          </ResponsiveHeader>

          <div>
            <Button variant="link" onClick={onDeselectAll}>
              Deselect All
            </Button>
            <Button variant="link" onClick={onSelectAll}>
              Select All
            </Button>
          </div>
          <ScrollArea className="mt-2 h-40 sm:h-[250px] p-2 border-primary rounded-sm border-solid border-[1px]">
            {itemsFieldArray.fields.map((fieldArrayValue, index) => {
              return (
                <div key={fieldArrayValue.id} className="pb-3">
                  <FormCheckbox name={`items.${index}.selected`} label={fieldArrayValue.name} />
                  <p className="text-sm">{fieldArrayValue.notes}</p>
                </div>
              );
            })}
          </ScrollArea>

          <ResponsiveFooter className="mt-4 flex-col-reverse">
            <Button type="button" variant="outline" onClick={() => onClose?.()}>
              Cancel
            </Button>
            <SubmitButton>Add Ingredients</SubmitButton>
          </ResponsiveFooter>
        </form>
      </Form>
    </ResponsiveContent>
  );
};
