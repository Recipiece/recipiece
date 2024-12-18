import { CircleArrowDown, CircleArrowUp, RefreshCcw } from "lucide-react";
import { DateTime } from "luxon";
import { FC, useCallback, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useGetMealPlanByIdQuery, useListItemsForMealPlanQuery } from "../../api";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, Button, LoadingGroup, Stack } from "../../component";
import { MealPlanItem } from "../../data";
import { floorDateToBeginningOfWeek, floorDateToDay } from "../../util";
import { MealPlanItemsCard } from "./MealPlanItemCard";

/**
 * This is a rather tricky form, and we're not even really using a form for this.
 * When we first load in, we will show only the current week, starting at monday.
 *
 * The user will be able to press an up button if the current week's start date is >= the meal plans created at date
 * This will load in the prior min(7, days between start of previous week and created at) days
 *
 * The user will also be able to press a down arrow that pops in more days below.
 *
 * The backend simply returns to us a list of all meal plan items on the meal plan for the given time period
 * We will organize that output into a form that looks like
 * {
 *   "<representation_date>": <meal_plan_items>[]
 * }
 * which is really just the meal plan items chunked into days.
 *
 * When the user presses the up/down, we'll expand the date range over which we want to look for items
 * and refetch that from the backend, re-reduce, and move along
 */

type MealPlanItemsFormType = { readonly [key: string]: Partial<MealPlanItem>[] };

export const MealPlanViewPage: FC = () => {
  const { id } = useParams();
  const mealPlanId = +id!;

  const { data: mealPlan, isLoading: isLoadingMealPlan } = useGetMealPlanByIdQuery(mealPlanId);

  const todayDate = useMemo(() => floorDateToDay(DateTime.now()), []);
  const baseDate = useMemo(() => floorDateToBeginningOfWeek(DateTime.utc()), []);

  const [currentStartDate, setCurrentStartDate] = useState<DateTime>(baseDate);
  const [currentEndDate, setCurrentEndDate] = useState<DateTime>(baseDate.plus({ days: 7 }));

  const daysBetweenBounds: DateTime[] = useMemo(() => {
    const duration = currentEndDate.diff(currentStartDate, ["days"]);
    const datesArray = [];
    for (let i = 0; i < duration.days; i++) {
      datesArray[i] = currentStartDate.plus({ days: i });
    }
    return datesArray;
  }, [currentStartDate, currentEndDate]);

  const { data: mealPlanItems, isLoading: isLoadingMealPlanItems } = useListItemsForMealPlanQuery(
    mealPlan?.id!,
    {
      start_date: currentStartDate.toUTC().toISO()!,
      end_date: currentEndDate.toUTC().toISO()!,
    },
    {
      disabled: !mealPlan,
    }
  );

  const mealPlanCreatedAt = useMemo(() => {
    return DateTime.fromISO(mealPlan?.created_at!);
  }, [mealPlan]);

  const defaultValues: MealPlanItemsFormType = useMemo(() => {
    if (mealPlanItems) {
      const reduced = mealPlanItems.meal_plan_items.reduce((accum: { [key: string]: MealPlanItem[] }, curr) => {
        const flooredIsoStartDate = floorDateToDay(DateTime.fromISO(curr.start_date)).toISO()!;
        const existingArrayForStartDate = accum[flooredIsoStartDate] ?? [];
        return {
          ...accum,
          [flooredIsoStartDate]: [
            ...existingArrayForStartDate,
            {
              ...curr,
              notes: curr.notes ?? "",
            },
          ],
        };
      }, {});
      return reduced;
    } else {
      return {};
    }
  }, [mealPlanItems]);

  const onLoadMoreAbove = useCallback(() => {
    const shifted = currentStartDate.minus({ days: 7 });
    const mealPlanCreatedAt = DateTime.fromISO(mealPlan!.created_at);
    const newVal = DateTime.max(shifted, mealPlanCreatedAt);
    setCurrentStartDate(newVal);
  }, [currentStartDate, mealPlan]);

  const onLoadMoreBelow = useCallback(() => {
    const shifted = currentEndDate.plus({ days: 7 });
    setCurrentEndDate(shifted);
  }, [currentEndDate]);

  const onResetDateBounds = useCallback(() => {}, []);

  return (
    <Stack>
      <LoadingGroup isLoading={isLoadingMealPlan} className="h-8 w-52">
        <div className="flex flex-col sm:flex-row">
          <h1 className="text-2xl">{mealPlan?.name}</h1>
          <Button variant="secondary" className="sm:ml-auto" onClick={onResetDateBounds}>
            <RefreshCcw />
          </Button>
        </div>
      </LoadingGroup>
      {mealPlan && (
        <div>
          <div className="text-center">
            <Button variant="ghost" onClick={onLoadMoreAbove} disabled={currentStartDate <= mealPlanCreatedAt}>
              <CircleArrowUp />
            </Button>
          </div>
          <Accordion type="multiple" defaultValue={[todayDate.toFormat("LLLL dd")]}>
            {daysBetweenBounds.map((day, index) => {
              console.log(defaultValues[floorDateToDay(day).toISO()!]);
              return (
                <AccordionItem key={index} value={day.toFormat("LLLL dd")}>
                  <AccordionTrigger>{day.toFormat("EEEE, LLLL dd")}</AccordionTrigger>
                  <AccordionContent>
                    <MealPlanItemsCard startDate={floorDateToDay(day)} mealPlan={mealPlan} initialMealPlanItems={defaultValues[floorDateToDay(day).toISO()!]} />
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
          <div className="text-center mt-2">
            <Button variant="ghost" onClick={onLoadMoreBelow} disabled={currentEndDate.diff(currentStartDate, ["months"]).months > 6}>
              <CircleArrowDown />
            </Button>
          </div>
        </div>
      )}
    </Stack>
  );
};
