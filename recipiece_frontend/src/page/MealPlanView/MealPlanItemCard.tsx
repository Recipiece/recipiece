import { Lightbulb, Minus, UtensilsCrossed } from "lucide-react";
import { DateTime } from "luxon";
import { FC, useCallback, useContext, useEffect, useState } from "react";
import { useCreateMealPlanItemMutation, useDeleteMealPlanItemMutation, useUpdateMealPlanItemMutation } from "../../api";
import { Button, Card, Input, Textarea } from "../../component";
import { DialogContext } from "../../context";
import { MealPlan, MealPlanItem, Recipe } from "../../data";

export interface MealPlanItemsCardProps {
  readonly mealPlan: MealPlan;
  readonly startDate: DateTime;
  readonly initialMealPlanItems: Partial<MealPlanItem>[];
}

export const MealPlanItemsCard: FC<MealPlanItemsCardProps> = ({ mealPlan, startDate, initialMealPlanItems }) => {
  const { pushDialog, popDialog } = useContext(DialogContext);
  const [currentValues, setCurrentValues] = useState([...(initialMealPlanItems ?? [])]);

  const { mutateAsync: createMealPlanItem } = useCreateMealPlanItemMutation();
  const { mutateAsync: updateMealPlanItem } = useUpdateMealPlanItemMutation();
  const { mutateAsync: deleteMealPlanItem } = useDeleteMealPlanItemMutation();

  useEffect(() => {
    setCurrentValues([...(initialMealPlanItems ?? [])]);
  }, [initialMealPlanItems]);

  const onAddRecipe = useCallback(() => {
    pushDialog("searchRecipes", {
      onClose: () => popDialog("searchRecipes"),
      onSubmit: async (recipe: Recipe) => {
        const createdItem = await createMealPlanItem({
          recipe_id: recipe.id,
          meal_plan_id: mealPlan.id,
          start_date: startDate.toUTC().toISO()!,
          notes: "",
        });
        setCurrentValues((prev) => [...prev, { ...createdItem.data }]);
        popDialog("searchRecipes");
      },
    });
  }, [pushDialog, popDialog, createMealPlanItem, mealPlan.id, startDate]);

  const onAddContent = useCallback(async () => {
    const createdItem = await createMealPlanItem({
      freeform_content: "",
      meal_plan_id: mealPlan.id,
      start_date: startDate.toUTC().toISO()!,
      notes: "",
    });
    setCurrentValues((prev) => [...prev, { ...createdItem.data }]);
  }, [createMealPlanItem, mealPlan.id, startDate]);

  const onRemoveItem = useCallback(
    async (mealPlanItemId: number) => {
      await deleteMealPlanItem({
        meal_plan_id: mealPlan.id,
        meal_plan_item_id: mealPlanItemId,
      });
      setCurrentValues((prev) => [...prev.filter((cv) => cv.id !== mealPlanItemId)]);
    },
    [deleteMealPlanItem, mealPlan.id]
  );

  const onUpdateNotes = useCallback(
    (mealPlanItemId: number, notes: string) => {
      updateMealPlanItem({
        id: mealPlanItemId,
        meal_plan_id: mealPlan.id,
        notes: notes,
      });
    },
    [mealPlan.id, updateMealPlanItem]
  );

  const onChangeNotes = useCallback((index: number, notes: string) => {
    setCurrentValues((prev) => {
      return prev.map((val, idx) => {
        if (index === idx) {
          return { ...val, notes: notes };
        } else {
          return { ...val };
        }
      });
    });
  }, []);

  const onChangeFreeformContent = useCallback((index: number, content: string) => {
    setCurrentValues((prev) => {
      return prev.map((val, idx) => {
        if (index === idx) {
          return { ...val, freeform_content: content };
        } else {
          return { ...val };
        }
      });
    });
  }, []);

  const onUpdateFreeformContent = useCallback(
    async (mealPlanItemId: number, content: string) => {
      updateMealPlanItem({
        id: mealPlanItemId,
        meal_plan_id: mealPlan.id,
        freeform_content: content,
      });
    },
    [mealPlan.id, updateMealPlanItem]
  );

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
        {currentValues.length === 0 && <p className="text-center pt-4 pb-4">There&apos;s nothing to make here. Try adding a recipe or idea to get started.</p>}
        {currentValues.map((value, index) => {
          const { id, recipe, freeform_content, notes } = value;
          let component;

          if (!!recipe) {
            component = (
              <div>
                <h1 className="text-lg">{recipe.name}</h1>
                {recipe.description && <p>{recipe.description}</p>}
              </div>
            );
          } else {
            component = (
              <Textarea
                placeholder="What do you want to make?"
                value={freeform_content}
                onChange={(event) => onChangeFreeformContent(index, event.target.value)}
                onBlur={(event) => onUpdateFreeformContent(id!, event.target.value)}
              />
            );
          }

          return (
            <div className="flex flex-row gap-2 items-top mt-4" key={index}>
              <span>{index + 1}.</span>
              <div className="flex flex-col gap-2 flex-grow">
                {component}
                <Input
                  placeholder="Anything to note?"
                  value={notes}
                  onBlur={(event) => onUpdateNotes(id!, event.target.value)}
                  onChange={(event) => onChangeNotes(index, event.target.value)}
                />
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
