import { zodResolver } from "@hookform/resolvers/zod";
import { CircleArrowDown, CircleArrowUp } from "lucide-react";
import { DateTime } from "luxon";
import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useListItemsForMealPlanQuery } from "../../api";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, Button, Form } from "../../component";
import { MealPlan, MealPlanItem } from "../../data";
import { floorDateToBeginningOfWeek, floorDateToDay } from "../../util";
import { MealPlanItemsCard } from "./MealPlanItemCard";

/**
 * This is a rather tricky form.
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
const MealPlanItemsFormSchema = z.record(
  z.string(),
  z.array(
    z.object({
      start_date: z.string(),
      recipe: z
        .object({
          name: z.string(),
          description: z.string().nullable(),
          id: z.number(),
        })
        .nullable()
        .optional(),
      recipe_id: z.number().nullable().optional(),
      freeform_content: z.string().nullable().optional(),
    })
  )
);

type MealPlanItemsFormType = z.infer<typeof MealPlanItemsFormSchema>;

export const MealPlanItemsForm: FC<{ readonly mealPlan: MealPlan }> = ({ mealPlan }) => {
  const todayDate = useMemo(() => floorDateToDay(DateTime.utc()), []);
  const baseDate = useMemo(() => floorDateToBeginningOfWeek(DateTime.utc()), []);

  const [currentStartDate, setCurrentStartDate] = useState<DateTime>(baseDate);
  const [currentEndDate, setCurrentEndDate] = useState(baseDate.plus({ days: 7 }));

  const daysBetweenBounds: DateTime[] = useMemo(() => {
    const duration = currentEndDate.diff(currentStartDate, ["days"]);
    const datesArray = [];
    for (let i = 0; i < duration.days; i++) {
      datesArray[i] = currentStartDate.plus({ days: i });
    }
    return datesArray;
  }, [currentStartDate, currentEndDate]);

  const { data: mealPlanItems, isLoading: isLoadingMealPlanItems } = useListItemsForMealPlanQuery(mealPlan.id, {
    start_date: currentStartDate.toUTC().toISO()!,
    end_date: currentEndDate.toUTC().toISO()!,
  });

  const mealPlanCreatedAt = useMemo(() => {
    return DateTime.fromISO(mealPlan.created_at);
  }, [mealPlan]);

  const defaultValues: MealPlanItemsFormType = useMemo(() => {
    if (mealPlanItems) {
      const reduced = mealPlanItems.meal_plan_items.reduce((accum: { [key: string]: MealPlanItem[] }, curr) => {
        const flooredIsoStartDate = floorDateToDay(DateTime.fromISO(curr.start_date)).toISO()!;
        const existingArrayForStartDate = accum[flooredIsoStartDate] ?? [];
        return {
          ...accum,
          [flooredIsoStartDate]: [...existingArrayForStartDate, curr],
        };
      }, {}) as MealPlanItemsFormType;
      return reduced;
    } else {
      return {};
    }
  }, [mealPlanItems]);

  const form = useForm<MealPlanItemsFormType>({
    resolver: zodResolver(MealPlanItemsFormSchema),
    defaultValues: { ...defaultValues },
  });

  useEffect(() => {
    form.reset({ ...defaultValues });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValues]);

  const onLoadMoreAbove = useCallback(() => {
    const shifted = currentStartDate.minus({ days: 7 });
    const mealPlanCreatedAt = DateTime.fromISO(mealPlan.created_at);
    const newVal = DateTime.max(shifted, mealPlanCreatedAt);
    setCurrentStartDate(newVal);
  }, [currentStartDate, mealPlan]);

  const onLoadMoreBelow = useCallback(() => {
    const shifted = currentEndDate.plus({ days: 7 });
    setCurrentEndDate(shifted);
  }, [currentEndDate]);

  return (
    <Form {...form}>
      <form onSubmit={(event) => event.preventDefault()}>
        <div className="text-center">
          <Button variant="ghost" onClick={onLoadMoreAbove} disabled={currentStartDate <= mealPlanCreatedAt}>
            <CircleArrowUp />
          </Button>
        </div>
        <Accordion type="multiple" defaultValue={[todayDate.toFormat("LLLL dd")]}>
          {daysBetweenBounds.map((day) => {
            return (
              <AccordionItem key={day.toMillis()} value={day.toFormat("LLLL dd")}>
                <AccordionTrigger>{day.toFormat("EEEE, LLLL dd")}</AccordionTrigger>
                <AccordionContent>
                  <MealPlanItemsCard startDate={floorDateToDay(day)} mealPlan={mealPlan} />
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
        <div className="text-center mt-2">
          <Button variant="ghost" onClick={onLoadMoreBelow}>
            <CircleArrowDown />
          </Button>
        </div>
      </form>
    </Form>
  );
};
