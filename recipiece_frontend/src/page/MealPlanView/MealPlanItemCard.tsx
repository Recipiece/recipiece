import { MealPlanSchema, RecipeSchema } from "@recipiece/types";
import { Minus } from "lucide-react";
import { DateTime } from "luxon";
import { FC, useCallback, useContext, useMemo } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Button, Card, CardContent, CardTitle, FormInput, FormTextarea, H3, H4, Separator, Skeleton } from "../../component";
import { DialogContext } from "../../context";
import { MealPlanItemsForm } from "./MealPlanForm";

export interface MealPlanItemCardProps {
  readonly mealPlan: MealPlanSchema;
  readonly date: DateTime;
  readonly isLoading: boolean;
  readonly isEditing: boolean;
  readonly dayId: number;
}

export interface MealPlanSectionProps {
  readonly mealPlan: MealPlanSchema;
  readonly baseDate: DateTime;
  readonly target: "morningItems" | "middayItems" | "eveningItems";
  readonly isEditing: boolean;
  readonly dayId: number;
}

const MealPlanSection: FC<MealPlanSectionProps> = ({ mealPlan, target, baseDate, isEditing, dayId }) => {
  const { pushDialog, popDialog } = useContext(DialogContext);

  const newItemStartDate = useMemo(() => {
    if (target === "morningItems") {
      return DateTime.fromObject({ year: baseDate.year, month: baseDate.month, day: baseDate.day, hour: 1 });
    } else if (target === "middayItems") {
      return DateTime.fromObject({ year: baseDate.year, month: baseDate.month, day: baseDate.day, hour: 13 });
    } else {
      return DateTime.fromObject({ year: baseDate.year, month: baseDate.month, day: baseDate.day, hour: 18 });
    }
  }, [target, baseDate]);

  const form = useFormContext<MealPlanItemsForm>();

  const { append, remove, fields } = useFieldArray({
    control: form.control,
    name: `mealPlanItems.${dayId}.${target}`,
  });

  const onAppendIdea = useCallback(() => {
    append({
      meal_plan_id: mealPlan.id,
      freeform_content: "",
      notes: "",
      start_date: newItemStartDate.toJSDate(),
    });
  }, [append, newItemStartDate, mealPlan]);

  const onAppendRecipe = useCallback(() => {
    pushDialog("searchRecipes", {
      onClose: () => popDialog("searchRecipes"),
      onSubmit: (recipe: RecipeSchema) => {
        append({
          meal_plan_id: mealPlan.id,
          recipe_id: recipe.id,
          recipe: { ...recipe },
          start_date: newItemStartDate.toJSDate(),
          notes: "",
        });
        popDialog("searchRecipes");
      },
    });
  }, [append, pushDialog, popDialog, newItemStartDate, mealPlan]);

  const onRemoveItem = useCallback(
    (index: number) => {
      remove(index);
    },
    [remove]
  );

  return (
    <>
      {target === "morningItems" && <H3>Morning</H3>}
      {target === "middayItems" && <H3>Midday</H3>}
      {target === "eveningItems" && <H3>Evening</H3>}
      {fields.length === 0 && (
        <p className="text-sm text-center">Nothing here yet!</p>
      )}
      {fields.map((item, index) => {
        {
          item;
        }
        let component = undefined;
        if (item.recipe) {
          component = (
            <div>
              <H4 className="underline">
                <a target="_blank" href={`/recipe/view/${item.recipe.id}`}>
                  {item.recipe.name}
                </a>
              </H4>
              {item.recipe.description && <p className="text-sm">{item.recipe.description}</p>}
            </div>
          );
        } else if (item.freeform_content !== null && item.freeform_content !== undefined) {
          if (!isEditing) {
            component = <p className="text-sm">{item.freeform_content}</p>;
          } else {
            component = <FormTextarea required name={`mealPlanItems.${dayId}.${target}.${index}.freeform_content`} label="Meal" placeholder="What are you thinking about?" />;
          }
        }

        let notesComponent = undefined;
        if (isEditing) {
          notesComponent = <FormInput name={`mealPlanItems.${dayId}.${target}.${index}.notes`} placeholder="Anything to note?" label="Notes" />;
        } else {
          notesComponent = <p className="text-xs">{item.notes ?? ""}</p>;
        }

        return (
          <div key={item.id} className="flex flex-col gap-2">
            {component && (
              <div className="pl-2 sm:pl-4 flex flex-col gap-2">
                {component}
                {notesComponent}
              </div>
            )}
            {isEditing && (
              <div className="flex flex-row justify-end">
                <Button variant="ghost" onClick={() => onRemoveItem(index)}>
                  <Minus className="text-destructive" />
                </Button>
              </div>
            )}
            {(index !== fields.length - 1 || isEditing) && <Separator />}
          </div>
        );
      })}
      {isEditing && (
        <div className="flex flex-row justify-center items-center gap-2">
          <Button onClick={onAppendRecipe} variant="outline">
            Add Recipe
          </Button>
          <span>or</span>
          <Button onClick={onAppendIdea} variant="outline">
            Add Idea
          </Button>
        </div>
      )}
    </>
  );
};

export const MealPlanItemCard: FC<MealPlanItemCardProps> = ({ isLoading, isEditing, mealPlan, date, dayId }) => {
  return (
    <Card className="p-6">
      <CardTitle className="mb-4">
        <div className="flex flex-row items-center gap-2">
          <span className="mr-auto">{date.toLocal().toFormat("EEEE, MMM dd")}</span>
        </div>
      </CardTitle>
      <CardContent>
        <div className="flex flex-col gap-4 whitespace-normal">
          {isLoading && (
            <>
              <Skeleton className="w-full h-8" />
              <Skeleton className="w-full h-8" />
              <Skeleton className="w-full h-8" />
            </>
          )}
          {!isLoading && (
            <>
              <MealPlanSection dayId={dayId} mealPlan={mealPlan} baseDate={date} target="morningItems" isEditing={isEditing} />
              <MealPlanSection dayId={dayId} mealPlan={mealPlan} baseDate={date} target="middayItems" isEditing={isEditing} />
              <MealPlanSection dayId={dayId} mealPlan={mealPlan} baseDate={date} target="eveningItems" isEditing={isEditing} />
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
