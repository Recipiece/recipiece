import { MealPlanItemSchema, MealPlanSchema, RecipeSchema } from "@recipiece/types";
import { Lightbulb, Minus, SquareArrowOutUpRight, UtensilsCrossed } from "lucide-react";
import { DateTime } from "luxon";
import { FC, useCallback, useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useCreateMealPlanItemMutation, useDeleteMealPlanItemMutation, useUpdateMealPlanItemMutation } from "../../api";
import { Button, Card, Input } from "../../component";
import { DialogContext } from "../../context";

export interface MealPlanItemsCardProps {
  readonly mealPlan: MealPlanSchema;
  readonly startDate: DateTime;
  readonly initialMealPlanItems: Partial<MealPlanItemSchema>[];
  readonly isEditing: boolean;
}

export const MealPlanItemsCard: FC<MealPlanItemsCardProps> = ({ mealPlan, startDate, initialMealPlanItems, isEditing }) => {
  const { pushDialog, popDialog } = useContext(DialogContext);
  const [currentValues, setCurrentValues] = useState([...(initialMealPlanItems ?? [])]);

  const { mutateAsync: createMealPlanItem } = useCreateMealPlanItemMutation();
  const { mutateAsync: updateMealPlanItem } = useUpdateMealPlanItemMutation();
  const { mutateAsync: deleteMealPlanItem } = useDeleteMealPlanItemMutation();

  useEffect(() => {
    setCurrentValues([...(initialMealPlanItems ?? [])]);
  }, [initialMealPlanItems]);

  const onAddRecipe = useCallback(() => {
    pushDialog("searchRecipesForMealPlan", {
      onClose: () => popDialog("searchRecipesForMealPlan"),
      onSubmit: async (recipe: RecipeSchema) => {
        const createdItem = await createMealPlanItem({
          recipe_id: recipe.id,
          meal_plan_id: mealPlan.id,
          start_date: startDate.toUTC().toJSDate()!,
          notes: "",
          label: `Meal ${currentValues.length + 1}`,
        });
        setCurrentValues((prev) => [...prev, { ...createdItem }]);
        popDialog("searchRecipesForMealPlan");
      },
    });
  }, [pushDialog, popDialog, createMealPlanItem, mealPlan.id, startDate, currentValues]);

  const onAddContent = useCallback(async () => {
    const createdItem = await createMealPlanItem({
      freeform_content: "",
      meal_plan_id: mealPlan.id,
      start_date: startDate.toUTC().toJSDate()!,
      notes: "",
      label: `Meal ${currentValues.length + 1}`,
    });
    setCurrentValues((prev) => [...prev, { ...createdItem }]);
  }, [createMealPlanItem, mealPlan.id, startDate, currentValues]);

  const onRemoveItem = useCallback(
    async (mealPlanItem: MealPlanItemSchema) => {
      await deleteMealPlanItem(mealPlanItem);
      setCurrentValues((prev) => [...prev.filter((cv) => cv.id !== mealPlanItem.id)]);
    },
    [deleteMealPlanItem]
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

  const onChangeLabel = useCallback((index: number, content: string) => {
    setCurrentValues((prev) => {
      return prev.map((val, idx) => {
        if (index === idx) {
          return { ...val, label: content };
        } else {
          return { ...val };
        }
      });
    });
  }, []);

  const onUpdateLabel = useCallback(
    async (mealPlanItemId: number, content: string) => {
      updateMealPlanItem({
        id: mealPlanItemId,
        meal_plan_id: mealPlan.id,
        label: content,
      });
    },
    [mealPlan.id, updateMealPlanItem]
  );

  return (
    <Card className="p-2">
      <div>
        <div className="flex flex-row items-center">
          <h1 className="text-lg font-bold">{startDate.toFormat("EEEE, LLLL dd")}</h1>
          {isEditing && (
            <div className="ml-auto flex flex-row gap-2">
              <Button variant="secondary" onClick={onAddRecipe}>
                <UtensilsCrossed size={16} /> <span className="hidden sm:inline ml-2">Add a Recipe</span>
              </Button>
              <Button variant="secondary" onClick={onAddContent}>
                <Lightbulb size={16} /> <span className="hidden sm:inline ml-2">Add an Idea</span>
              </Button>
            </div>
          )}
        </div>
      </div>
      <div>
        {currentValues.length === 0 && <p className="text-center text-sm pt-4 pb-4">Nothing to make here!</p>}
        {currentValues.map((value, index) => {
          const { id, recipe, freeform_content, notes, label } = value;
          let component;

          if (!!recipe) {
            component = (
              <div>
                <Link to={`/recipe/view/${recipe.id}`} target="_blank" rel="noopener noreferrer">
                  <div className="inline-flex flex-row items-center gap-2">
                    <h1 className="text-lg underline">{recipe.name}</h1>
                    <SquareArrowOutUpRight className="hidden sm:block" />
                  </div>
                </Link>

                {recipe.description && <p>{recipe.description}</p>}
              </div>
            );
          } else {
            if (isEditing) {
              component = (
                <Input
                  placeholder="What do you want to make?"
                  value={freeform_content ?? ""}
                  onChange={(event) => onChangeFreeformContent(index, event.target.value)}
                  onBlur={(event) => onUpdateFreeformContent(id!, event.target.value)}
                />
              );
            } else {
              component = <p>{freeform_content}</p>;
            }
          }

          return (
            <div key={id} className="grid gap-2 items-center mt-4 p-4">
              <div className="col-span-12 sm:col-span-3">
                {isEditing && (
                  <Input
                    placeholder="What is this meal for?"
                    value={label ?? ""}
                    onChange={(event) => onChangeLabel(index, event.target.value)}
                    onBlur={(event) => onUpdateLabel(id!, event.target.value)}
                  />
                )}
                {!isEditing && !!label && <h1 className="text-xl">{label}</h1>}
              </div>
              <div className="col-span-12">{component}</div>
              <div className="col-span-12">
                {isEditing && (
                  <Input
                    placeholder="Anything to note?"
                    value={notes ?? ""}
                    onBlur={(event) => onUpdateNotes(id!, event.target.value)}
                    onChange={(event) => onChangeNotes(index, event.target.value)}
                  />
                )}
                {!isEditing && !!notes && <p className="text-sm">{notes}</p>}
              </div>
              {isEditing && (
                <div className="col-span-12 flex flex-row">
                  <Button variant="ghost" onClick={() => onRemoveItem(value as MealPlanItemSchema)} className="text-destructive ml-auto">
                    <Minus />
                  </Button>
                </div>
              )}
              {currentValues.length > 1 && index < currentValues.length - 1 && <hr className="col-span-12" />}
            </div>
          );
        })}
      </div>
    </Card>
  );
};
