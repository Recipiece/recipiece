import { Constant } from "@recipiece/constant";
import { MealPlanSchema, RecipeSchema } from "@recipiece/types";
import { ArrowLeft } from "lucide-react";
import { DateTime } from "luxon";
import { FC, useState } from "react";
import { Button, Calendar } from "../../component";
import { useResponsiveDialogComponents } from "../../hooks";
import { floorDateToDay } from "../../util";
import { BaseDialogProps } from "../BaseDialogProps";

export interface SelectMealPlanTimeDialogProps extends BaseDialogProps<DateTime> {
  readonly mealPlan: MealPlanSchema;
  readonly recipe: RecipeSchema;
}

export const SelectMealPlanTimeDialog: FC<SelectMealPlanTimeDialogProps> = ({ mealPlan, recipe, onSubmit }) => {
  const { ResponsiveContent, ResponsiveHeader, ResponsiveDescription, ResponsiveTitle } = useResponsiveDialogComponents();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stage, setStage] = useState<"date" | "segment">("date");
  const [date, setDate] = useState<DateTime>();

  const flooredMealPlanCreatedAt = floorDateToDay(DateTime.fromJSDate(mealPlan.created_at, { zone: "UTC" }));

  const onSelectDate = (date?: Date) => {
    if (date) {
      setDate(DateTime.fromJSDate(date));
      setStage("segment");
    }
  };

  const onSelectTimeOfDay = async (time: "morning" | "afternoon" | "evening") => {
    setIsSubmitting(true);
    // floor the date, then offset it by however many hours
    let mealPlanDateTime = floorDateToDay(date!.toUTC());
    if (time === "morning") {
      mealPlanDateTime = mealPlanDateTime.plus({ hours: Constant.MealPlan.HOUR_OFFSET_MORNING });
    } else if (time === "afternoon") {
      mealPlanDateTime = mealPlanDateTime.plus({ hours: Constant.MealPlan.HOUR_OFFSET_MIDDAY });
    } else if (time === "evening") {
      mealPlanDateTime = mealPlanDateTime.plus({ hours: Constant.MealPlan.HOUR_OFFSET_EVENING });
    }

    try {
      await onSubmit?.(mealPlanDateTime);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ResponsiveContent className="h-full p-6 sm:h-auto">
      <ResponsiveHeader className="mb-4">
        <ResponsiveTitle className="flex flex-row items-center gap-2 text-center mb-2">
          {stage === "segment" && (
            <Button className="absolute left-4" disabled={isSubmitting} variant="ghost" onClick={() => setStage("date")}>
              <ArrowLeft />
            </Button>
          )}
          <span className="m-auto">Select the {stage === "date" ? "Day" : "Time"}</span>
        </ResponsiveTitle>
        <ResponsiveDescription>
          {stage === "date" && <>Select the day want to make {recipe.name}</>}
          {stage === "segment" && (
            <>
              Select when on {date?.toLocaleString(DateTime.DATE_MED)} you want to make {recipe.name}
            </>
          )}
        </ResponsiveDescription>
      </ResponsiveHeader>

      {stage === "date" && (
        <div className="flex items-center justify-center">
          <Calendar
            selected={date?.toJSDate()}
            disabled={(date) => DateTime.fromJSDate(date, { zone: "UTC" }).toLocal() < flooredMealPlanCreatedAt.toLocal()}
            mode="single"
            onSelect={onSelectDate}
          />
        </div>
      )}
      {stage === "segment" && (
        <div className="flex flex-col gap-2">
          <Button variant="outline" disabled={isSubmitting} onClick={() => onSelectTimeOfDay("morning")}>
            Morning
          </Button>
          <Button variant="outline" disabled={isSubmitting} onClick={() => onSelectTimeOfDay("afternoon")}>
            Midday
          </Button>
          <Button variant="outline" disabled={isSubmitting} onClick={() => onSelectTimeOfDay("evening")}>
            Evening
          </Button>
        </div>
      )}
    </ResponsiveContent>
  );
};
