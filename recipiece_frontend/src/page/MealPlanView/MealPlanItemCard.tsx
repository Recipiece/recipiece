import { Lightbulb, Minus, UtensilsCrossed } from "lucide-react";
import { DateTime } from "luxon";
import { FC, useCallback, useContext, useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { useCreateMealPlanItemMutation, useDeleteMealPlanItemMutation, useUpdateMealPlanItemMutation } from "../../api";
import { Button, Card, FormInput, FormTextarea } from "../../component";
import { DialogContext } from "../../context";
import { MealPlan, MealPlanItem, Recipe } from "../../data";

export const MealPlanItemsCard: FC<{ readonly mealPlan: MealPlan; readonly startDate: DateTime }> = ({ mealPlan, startDate }) => {
  const { pushDialog, popDialog } = useContext(DialogContext);
  const form = useFormContext();

  const { mutateAsync: createMealPlanItem } = useCreateMealPlanItemMutation();
  const { mutateAsync: updateMealPlanItem } = useUpdateMealPlanItemMutation();
  const { mutateAsync: deleteMealPlanItem } = useDeleteMealPlanItemMutation();

  const formKey = useMemo(() => {
    return startDate.toISO()!;
  }, [startDate]);

  const currentValues: Partial<MealPlanItem>[] = form.watch(formKey);

  const onAddRecipe = useCallback(() => {
    pushDialog("searchRecipes", {
      onClose: () => popDialog("searchRecipes"),
      onSubmit: async (recipe: Recipe) => {
        form.setValue(formKey, [
          ...(currentValues ?? []),
          {
            recipe: recipe,
            recipe_id: recipe.id,
            meal_plan_id: mealPlan.id,
            start_date: startDate,
            notes: "",
          },
        ]);
        createMealPlanItem({
          recipe_id: recipe.id,
          meal_plan_id: mealPlan.id,
          start_date: startDate.toUTC().toISO()!,
        }).then((createdData) => {
          form.setValue(`${formKey}.${(currentValues ?? []).length}.id`, createdData.data.id);
        });

        popDialog("searchRecipes");
      },
    });
  }, [pushDialog, popDialog, createMealPlanItem, mealPlan.id, startDate, form, formKey, currentValues]);

  const onAddContent = useCallback(async () => {
    form.setValue(formKey, [
      ...(currentValues ?? []),
      {
        freeform_content: "",
        start_date: startDate,
        meal_plan_id: mealPlan.id,
        notes: "",
      },
    ]);
    createMealPlanItem({
      freeform_content: "",
      meal_plan_id: mealPlan.id,
      start_date: startDate.toUTC().toISO()!,
    }).then((createdData) => {
      form.setValue(`${formKey}.${(currentValues ?? []).length}.id`, createdData.data.id);
    });
  }, [createMealPlanItem, mealPlan.id, startDate, form, formKey, currentValues]);

  const onRemoveItem = useCallback(
    async (mealPlanItemId: number) => {
      deleteMealPlanItem({
        meal_plan_id: mealPlan.id,
        meal_plan_item_id: mealPlanItemId,
      });
      form.setValue(formKey, [...(currentValues ?? []).filter((cv) => cv.id !== mealPlanItemId)]);
    },
    [currentValues, deleteMealPlanItem, form, formKey, mealPlan.id]
  );

  const onUpdateItem = useCallback(async (index: number) => {
    const { id } = form.getValues(`${formKey}.${index}`);
  }, []);

  return (
    <Card className="p-2">
      <div>
        <div className="flex flex-row items-center">
          <div className="ml-auto flex flex-row gap-2">
            <Button variant="secondary" onClick={onAddRecipe}>
              <UtensilsCrossed size={16} /> <span className="hidden sm:inline ml-2">Add a Recipe</span>
            </Button>
            <Button variant="secondary" onClick={onAddContent}>
              <Lightbulb size={16} /> <span className="hidden sm:inline ml-2">Add an Idea</span>
            </Button>
          </div>
        </div>
      </div>
      <div>
        {(currentValues ?? []).length === 0 && <p className="text-center pt-4 pb-4">There&apos;s nothing to make here. Try adding a recipe or idea to get started.</p>}
        {(currentValues ?? []).map((value, index) => {
          const { id, recipe } = value;
          let component;

          if (!!recipe) {
            component = (
              <div>
                <h1 className="text-lg">{recipe.name}</h1>
                {recipe.description && <p>{recipe.description}</p>}
              </div>
            );
          } else {
            component = <FormTextarea name={`${formKey}.${index}.freeform_content`} placeholder="What do you want to make?" />;
          }

          return (
            <div className="flex flex-row gap-2 items-top mt-4" key={index}>
              <span>{index + 1}.</span>
              <div className="flex flex-col gap-2 flex-grow">
                {component}
                <FormInput onBlur={(event) => console.log(event.target.value)} name={`${formKey}.${index}.notes`} placeholder="Anything to note?" />
                <div className="flex flex-row">
                  <Button variant="ghost" onClick={() => onRemoveItem(id!)} className="text-destructive ml-auto">
                    <Minus />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
