import { DateTime, Duration } from "luxon";
import { FC, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useGetMealPlanByIdQuery, useUpdateMealPlanMutation } from "../../api";
import { LoadingGroup, Stack, useToast } from "../../component";
import { MealPlanItemsForm } from "./MealPlanItemsForm";

export const MealPlanViewPage: FC = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const mealPlanId = +id!;

  const { data: mealPlan, isLoading: isLoadingMealPlan } = useGetMealPlanByIdQuery(mealPlanId);
  const { mutateAsync: updateMealPlan, isPending: isUpdatingMealPlan } = useUpdateMealPlanMutation();

  // const mealPlanStartDate = useMemo(() => {
  //   if (mealPlan) {
  //     return DateTime.fromISO(mealPlan.start_date);
  //   }
  //   return undefined;
  // }, [mealPlan]);

  const mealPlanDuration = useMemo(() => {
    if (mealPlan) {
      return Duration.fromISO(mealPlan.duration);
    }
    return undefined;
  }, [mealPlan]);

  const minDay = useMemo(() => {
    const now = DateTime.utc();
    return DateTime.fromObject({
      year: now.year,
      month: now.month,
      day: now.day,
    }).toJSDate();
  }, []);

  return (
    <Stack>
      <LoadingGroup isLoading={isLoadingMealPlan} className="h-8 w-52">
        <h1 className="text-2xl">{mealPlan?.name}</h1>
      </LoadingGroup>
      <LoadingGroup isLoading={isLoadingMealPlan}>
        {mealPlan && (
          <>
            {/* <p className="text-sm">
              This meal plan starts on {mealPlanStartDate!.toLocal().toFormat("LLLL dd")} and lasts {mealPlanDuration!.toFormat("d")} day{mealPlanDuration!.days > 1 ? "s" : ""}.
              You can change the start date by selecting a new date below.
            </p> */}
          </>
        )}
        <div className="w-full sm:max-w-[240px]">
          {/* <DateTimePicker
            disabled={isUpdatingMealPlan}
            min={minDay}
            value={mealPlanStartDate?.toJSDate()}
            onChange={(date) => {
              onChangeMealPlanDate(date);
            }}
            hideTime
          /> */}
        </div>
      </LoadingGroup>
      {mealPlan && <MealPlanItemsForm mealPlan={mealPlan} />}
    </Stack>
  );
};
