import { MealPlanSchema, RecipeSchema } from "@recipiece/types";
import { DateTime } from "luxon";
import { useContext } from "react";
import { useCreateMealPlanItemMutation } from "../../../../api";
import { DialogContext } from "../../../../context";
import { useLayout } from "../../../../hooks";
import { useToast } from "../../../shadcn";

/**
 * Handle the modal flow for adding a recipe to a meal plan.
 *
 * On mobile:
 * 1. Select a meal plan
 * 2. Select a date in the meal plan
 * 3. Select the items to add
 *
 * On non-mobile:
 * 1. Select a date in the provided meal plan
 * 2. Select the items to add
 */
export const useAddToMealPlanModalMadness = (recipe: RecipeSchema) => {
  const { pushDialog, popDialog } = useContext(DialogContext);
  const { isMobile } = useLayout();
  const { toast } = useToast();

  const { mutateAsync: addRecipeToMealPlan } = useCreateMealPlanItemMutation();

  const addToMealPlan = (mealPlan?: MealPlanSchema) => {
    if (isMobile) {
      mobileOnAddToMealPlan();
    } else {
      onSelectTime(mealPlan!);
    }
  };

  const mobileOnAddToMealPlan = () => {
    pushDialog("mobileMealPlans", {
      onClose: () => popDialog("mobileMealPlans"),
      onSubmit: (mealPlan: MealPlanSchema) => {
        popDialog("mobileMealPlans");
        onSelectTime(mealPlan);
      },
    });
  };

  const onSelectTime = (mealPlan: MealPlanSchema) => {
    pushDialog("selectMealPlanTime", {
      onClose: () => popDialog("selectMealPlanTime"),
      onSubmit: async (time: DateTime) => {
        await onAddToMealPlan(mealPlan, time);
        popDialog("selectMealPlanTime");
      },
      mealPlan: mealPlan,
      recipe: recipe,
    });
  };

  const onAddToMealPlan = async (mealPlan: MealPlanSchema, time: DateTime) => {
    try {
      await addRecipeToMealPlan({
        recipe_id: recipe.id,
        meal_plan_id: mealPlan.id,
        start_date: time.toJSDate(),
      });
      toast({
        title: "Recipe Added to Meal Plan",
        description: `${recipe.name} was added to ${mealPlan.name}.`,
      });
    } catch {
      toast({
        title: "Unable to Add Recipe to Meal Plan",
        description: `There was an error adding ${recipe.name} to ${mealPlan.name}. Try again later.`,
        variant: "destructive",
      });
    }
  };

  return { addToMealPlan };
};
