import { MealPlanSchema, ShoppingListSchema } from "@recipiece/types";
import { DateTime } from "luxon";
import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { DateRange } from "react-day-picker";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { useListMealPlanItemsQuery } from "../../api";
import { Button, Calendar, Form, FormCheckbox, LoadingGroup, ScrollArea, SubmitButton } from "../../component";
import { useResponsiveDialogComponents } from "../../hooks";
import { BaseDialogProps } from "../BaseDialogProps";
import { zodResolver } from "@hookform/resolvers/zod";

export interface AddMealPlanToShoppingListDialogProps extends BaseDialogProps<AddMealPlanToShoppingListForm> {
  readonly mealPlan: MealPlanSchema;
  readonly shoppingList: ShoppingListSchema;
}

const AddMealPlanToShoppingListFormSchema = z.object({
  items: z.array(
    z.object({
      name: z.string(),
      recipeName: z.string(),
      notes: z.string(),
      selected: z.boolean(),
    })
  ),
});

export type AddMealPlanToShoppingListForm = z.infer<typeof AddMealPlanToShoppingListFormSchema>;

export const AddMealPlanToShoppingListDialog: FC<AddMealPlanToShoppingListDialogProps> = ({ onSubmit, mealPlan }) => {
  const { ResponsiveContent, ResponsiveHeader, ResponsiveDescription, ResponsiveTitle, ResponsiveFooter } = useResponsiveDialogComponents();
  const [page, setPage] = useState<"date_select" | "items_select">("date_select");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: DateTime.utc().toLocal().toJSDate(),
    to: DateTime.utc().plus({ days: 1 }).toLocal().toJSDate(),
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dataStartDate = useMemo(() => {
    const dateFrom = dateRange?.from;
    if (dateFrom) {
      return DateTime.fromJSDate(dateFrom).toUTC();
    }
    return DateTime.utc();
  }, [dateRange]);

  const dataEndDate = useMemo(() => {
    const dateFrom = dateRange?.to ?? dateRange?.from;
    if (dateFrom) {
      return DateTime.fromJSDate(dateFrom).toUTC();
    }
    return DateTime.utc();
  }, [dateRange]);

  const { data: mealPlanItems, isLoading: isLoadingMealPlanItems } = useListMealPlanItemsQuery(
    mealPlan.id,
    {
      page_number: 0,
      start_date: dataStartDate.toISO(),
      end_date: dataEndDate.toISO(),
    },
    {
      enabled: page === "items_select",
    }
  );

  const defaultValues: AddMealPlanToShoppingListForm = useMemo(() => {
    if (mealPlanItems) {
      const itemsWithRecipes = mealPlanItems.data
        .filter((item) => !!item.recipe)
        .map((item) => {
          return (item.recipe!.ingredients ?? []).map((ing) => {
            let notesString = `${item.recipe!.name} - `;
            if (ing.amount) {
              notesString += `${ing.amount} `;
            }
            if (ing.unit) {
              notesString += `${ing.unit} `;
            }
            return {
              name: ing.name,
              recipeName: item.recipe!.name,
              notes: notesString.trim(),
              selected: true,
            };
          });
        })
        .flat();
      return {
        items: itemsWithRecipes,
      };
    } else {
      return {
        items: [],
      };
    }
  }, [mealPlanItems]);

  const form = useForm<AddMealPlanToShoppingListForm>({
    resolver: zodResolver(AddMealPlanToShoppingListFormSchema),
    defaultValues: { ...defaultValues },
  });

  const { fields } = useFieldArray({
    control: form.control,
    name: "items",
  });

  useEffect(() => {
    form.reset({ ...defaultValues });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValues]);

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

  const onAddToShoppingList = useCallback(
    async (formData: AddMealPlanToShoppingListForm) => {
      setIsSubmitting(true);
      try {
        await onSubmit?.(formData);
      } catch {
        // noop
      } finally {
        setIsSubmitting(false);
      }
    },
    [onSubmit]
  );

  return (
    <ResponsiveContent className="h-full p-6 sm:h-[480px]">
      <Form {...form}>
        <form className="flex h-full flex-col" onSubmit={form.handleSubmit(onAddToShoppingList)}>
          <ResponsiveHeader className="mb-4">
            <ResponsiveTitle>Add {mealPlan.name} to your shopping list</ResponsiveTitle>
            <ResponsiveDescription>
              {page === "date_select" && "Select a date range of meal plans to add."}
              {page === "items_select" && "Select the items to add to your shopping list."}
            </ResponsiveDescription>
          </ResponsiveHeader>

          {page === "date_select" && (
            <div className="flex flex-row justify-center">
              <Calendar
                disabled={(date) => DateTime.fromJSDate(date) < DateTime.fromJSDate(mealPlan.created_at)}
                min={2}
                max={60}
                mode="range"
                selected={dateRange}
                onSelect={setDateRange}
              />
            </div>
          )}

          {page === "items_select" && (
            <LoadingGroup isLoading={isLoadingMealPlanItems} variant="spinner" className="h-6 w-6">
              {fields.length > 0 && (
                <>
                  <div className="flex-grow-0">
                    <Button variant="link" onClick={onDeselectAll}>
                      Deselect All
                    </Button>
                    <Button variant="link" onClick={onSelectAll}>
                      Select All
                    </Button>
                  </div>

                  <ScrollArea className="rounded-sm border-[1px] border-solid border-primary p-2 sm:h-[250px]">
                    {fields.map((fieldArrayValue, index) => {
                      return (
                        <div key={fieldArrayValue.id} className="pb-3">
                          <FormCheckbox name={`items.${index}.selected`} label={fieldArrayValue.name} />
                          <span className="p-2 text-xs text-muted">{fieldArrayValue.recipeName}</span>
                        </div>
                      );
                    })}
                  </ScrollArea>
                </>
              )}
              {fields.length === 0 && (
                <p className="text-center text-sm">
                  There are no recipes with ingredients between {dataStartDate.toFormat("MMM. dd")} and {dataEndDate.toFormat("MMM. dd")}. Select a different date range.
                </p>
              )}
            </LoadingGroup>
          )}

          <ResponsiveFooter className="mt-auto flex-col">
            {page === "date_select" && (
              <Button disabled={!dateRange?.from || !dateRange?.to} type="button" variant="outline" onClick={() => setPage("items_select")}>
                Next
              </Button>
            )}
            {page === "items_select" && (
              <>
                <Button disabled={isSubmitting} type="button" variant="outline" onClick={() => setPage("date_select")}>
                  Back
                </Button>
                <SubmitButton disabled={fields.length === 0 || isSubmitting}>Add Items</SubmitButton>
              </>
            )}
          </ResponsiveFooter>
        </form>
      </Form>
    </ResponsiveContent>
  );
};
