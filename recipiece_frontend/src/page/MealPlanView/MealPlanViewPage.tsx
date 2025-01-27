import { MealPlanItemSchema } from "@recipiece/types";
import { ArrowLeft, ArrowRight, CircleCheck, CircleX, GanttChart, Home, MoreVertical, Pencil, Settings } from "lucide-react";
import { DateTime } from "luxon";
import { FC, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { useGetMealPlanByIdQuery, useGetSelfQuery, useListMealPlanItemsQuery } from "../../api";
import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, Form, H2, LoadingGroup, RecipieceMenuBarContext, SubmitButton } from "../../component";
import { useLayout } from "../../hooks";
import { ceilDateToDay, floorDateToDay } from "../../util";
import { FormyMealPlanItem, MealPlanItemsForm } from "./MealPlanForm";
import { MealPlanItemCard } from "./MealPlanItemCard";

const mealPlanItemSorter = (a: FormyMealPlanItem, b: FormyMealPlanItem) => {
  let stringyA = "";
  if (a.recipe) {
    stringyA = a.recipe.name;
  } else if (a.freeform_content) {
    stringyA = a.freeform_content;
  }

  let stringyB = "";
  if (b.recipe) {
    stringyB = b.recipe.name;
  } else if (b.freeform_content) {
    stringyB = b.freeform_content;
  }

  if (stringyA && stringyB) {
    return stringyA.localeCompare(stringyB);
  } else if (stringyA && !stringyB) {
    return 1;
  } else if (!stringyA && stringyB) {
    return -1;
  } else {
    return 0;
  }
};

export const MealPlanViewPage: FC = () => {
  const params = useParams();
  const mealPlanId = +params.id!;
  const navigate = useNavigate();

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [observer, setObserver] = useState<IntersectionObserver | undefined>(undefined);
  const [inViewId, setInViewId] = useState(0);
  const [debouncedInViewId, setDebouncedInViewId] = useState(0);
  const [viewStartDate, setViewStartDate] = useState<DateTime>(DateTime.utc().minus({ days: 2 }));
  const [viewEndDate, setViewEndDate] = useState<DateTime>(DateTime.utc().plus({ days: 2 }));
  const [mappedMealPlanItems, setMappedMealPlanItems] = useState<MealPlanItemsForm>({ mealPlanItems: new Array(5) });

  const dataStartDate = useMemo(() => viewStartDate.plus({ days: inViewId - 4 }), [viewStartDate, inViewId]);
  const dataEndDate = useMemo(() => viewStartDate.plus({ days: inViewId + 4 }), [viewStartDate, inViewId]);

  const daysSpan = useMemo(() => {
    return viewEndDate && viewStartDate ? Math.ceil(viewEndDate.diff(viewStartDate, "days").days) : 0;
  }, [viewEndDate, viewStartDate]);

  const elementWindow = useMemo(() => {
    return Array.from(Array(daysSpan).keys());
  }, [daysSpan]);

  const { mobileMenuPortalRef } = useContext(RecipieceMenuBarContext);
  const { isMobile } = useLayout();

  const { data: user, isLoading: isLoadingUser } = useGetSelfQuery();
  const { data: mealPlan, isLoading: isLoadingMealPlan } = useGetMealPlanByIdQuery(mealPlanId);
  const { data: mealPlanItems, isLoading: isLoadingMealPlanItems } = useListMealPlanItemsQuery(mealPlanId, {
    start_date: floorDateToDay(dataStartDate).toISO(),
    end_date: ceilDateToDay(dataEndDate).toISO(),
    page_number: 0,
  });

  const form = useForm<MealPlanItemsForm>({
    defaultValues: {
      mealPlanItems: [],
    },
  });

  /**
   * Debounce the view id change so as to not fire off 100000 requests on scroll
   */
  useEffect(() => {
    const timeout = setTimeout(() => {
      setInViewId(debouncedInViewId);
    }, 200);

    return () => {
      clearTimeout(timeout);
    };
  }, [debouncedInViewId]);

  useEffect(() => {
    const items = mealPlanItems?.data ?? [];
    setMappedMealPlanItems((prev) => {
      /**
       * Reduce down the results and sort them into buckets based on the day the start dates correspond to.
       *
       * Then, place them in a further bucket based on the "time of day" that the item falls into for a given day.
       *
       * Then, sort the items alphabetically so as to not continually shuffle them around.
       *
       * Finally, merge whatever the previous values were up with the new reduced values.
       *
       * That gives us our nicely sorted form data.
       */
      const reduced: MealPlanItemsForm["mealPlanItems"] = items.reduce((rolling: MealPlanItemsForm["mealPlanItems"], curr: MealPlanItemSchema) => {
        const itemStartDate = DateTime.fromJSDate(curr.start_date);
        const daysDiff = Math.round(itemStartDate.diff(viewStartDate, "days").days);
        let entry = rolling[daysDiff] ?? {};

        if (itemStartDate.hour < 12) {
          entry = {
            ...entry,
            morningItems: [...(entry.morningItems ?? []), curr],
          };
        } else if (itemStartDate.hour >= 12 && itemStartDate.hour <= 17) {
          entry = {
            ...entry,
            middayItems: [...(entry.middayItems ?? []), curr],
          };
        } else {
          entry = {
            ...entry,
            eveningItems: [...(entry.eveningItems ?? []), curr],
          };
        }
        const copy = [...rolling];
        copy[daysDiff] = entry;
        return copy;
      }, []);

      const sortedReduced: MealPlanItemsForm["mealPlanItems"] = reduced.map((entry) => {
        return {
          morningItems: [...(entry?.morningItems ?? []).sort(mealPlanItemSorter)],
          middayItems: [...(entry?.middayItems ?? []).sort(mealPlanItemSorter)],
          eveningItems: [...(entry?.eveningItems ?? []).sort(mealPlanItemSorter)],
        };
      });

      let merged = [];
      if (prev.mealPlanItems.length > sortedReduced.length) {
        merged = prev.mealPlanItems.map((_, idx) => {
          return sortedReduced[idx] ?? prev.mealPlanItems[idx];
        });
      } else {
        merged = sortedReduced;
      }

      return {
        mealPlanItems: [...merged],
      };
    });
  }, [mealPlanItems]);

  /**
   * Reset the form but keep whatever is currently being edited when we get new values
   */
  useEffect(() => {
    form.reset(
      { ...mappedMealPlanItems },
      {
        keepDirtyValues: isEditing,
      }
    );
  }, [mappedMealPlanItems]);

  /**
   * Reset the mapped values when we change meal plan ids
   */
  useEffect(() => {
    setMappedMealPlanItems({
      mealPlanItems: new Array(5),
    });
  }, [mealPlanId]);

  const contextMenu = useMemo(() => {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild className="ml-auto">
          <Button variant="ghost" className="text-primary">
            <MoreVertical />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {user?.id === mealPlan?.user_id && (
            <DropdownMenuItem>
              <Pencil /> Edit Name
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => navigate(`/meal-plan/${mealPlan!.id}/configuration`)}>
            <Settings /> Configure
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }, [user, mealPlan]);

  const onNextDay = useCallback(() => {
    const element = document.getElementById(`entry:${inViewId + 1}`);
    element?.scrollIntoView({ behavior: "smooth" });
  }, [inViewId]);

  const onPreviousDay = useCallback(() => {
    const element = document.getElementById(`entry:${inViewId - 1}`);
    element?.scrollIntoView({ behavior: "smooth" });
  }, [inViewId]);

  const onHomeDay = useCallback(() => {
    if (viewStartDate) {
      const homeElementNumber = Math.round(DateTime.utc().diff(viewStartDate, "days").days);
      const element = document.getElementById(`entry:${homeElementNumber}`);
      element?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [viewStartDate]);

  /**
   * Setup the view start and end dates, which are 3 months in either direct from today.
   * Bound the start of the view to the min of (three months ago, meal plan start date)
   */
  useEffect(() => {
    if (mealPlan) {
      const mealPlanCreatedAt = DateTime.fromJSDate(mealPlan.created_at).toUTC();
      const threeMonthsAgo = DateTime.utc().minus({ months: 3 });
      const startDate = mealPlanCreatedAt < threeMonthsAgo ? threeMonthsAgo : mealPlanCreatedAt;
      const endDate = DateTime.utc().plus({ months: 3 });
      setViewStartDate(startDate);
      setViewEndDate(endDate);
    }
  }, [mealPlan]);

  /**
   * When we setup the start date, scroll the "right" item into view
   */
  useEffect(() => {
    if (viewStartDate) {
      const homeElementNumber = Math.round(DateTime.utc().diff(viewStartDate, "days").days);
      const element = document.getElementById(`entry:${homeElementNumber}`);
      element?.scrollIntoView({ behavior: "instant", block: "nearest" } as unknown as ScrollOptions);
    }
  }, [viewStartDate]);

  useEffect(() => {
    if (scrollContainerRef.current) {
      const cb = (entries: IntersectionObserverEntry[]) => {
        const intersectingEntries = entries.filter((e) => e.isIntersecting && e.intersectionRatio === 1.0);
        if (intersectingEntries.length > 0) {
          const currentEntry = intersectingEntries[0];
          if (currentEntry) {
            const splitId = currentEntry.target.id.split(":")[1];
            const entryNumber = Number.parseInt(splitId);
            setDebouncedInViewId(entryNumber);
          }
        }
      };

      const observer = new IntersectionObserver(cb, {
        root: scrollContainerRef.current,
        rootMargin: "0px",
        threshold: 1.0,
      });
      setObserver(observer);
    }

    return () => {
      observer?.disconnect?.();
    };
  }, [isLoadingMealPlan]);

  useEffect(() => {
    elementWindow
      .map((windowId) => {
        return document.getElementById(`entry:${windowId}`);
      })
      .forEach((val) => {
        if (val) {
          observer?.observe?.(val);
        }
      });

    return () => {
      elementWindow
        .map((windowId) => {
          return document.getElementById(`entry:${windowId}`);
        })
        .forEach((val) => {
          if (val) {
            observer?.unobserve?.(val);
          }
        });
    };
  }, [elementWindow]);

  const onSubmit = useCallback((formData: MealPlanItemsForm) => {
    setIsEditing(false);
  }, []);

  const onCancelEditing = useCallback(() => {
    setIsEditing(false);
    form.reset({ ...mappedMealPlanItems });
  }, [mappedMealPlanItems, form]);

  return (
    <LoadingGroup isLoading={isLoadingMealPlan || isLoadingUser} variant="skeleton" className="w-full sm:w-[300px] h-11">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-2">
            <div className="flex flex-row items-center">
              <H2>{mealPlan?.name}</H2>

              {isMobile && mobileMenuPortalRef && mobileMenuPortalRef.current && createPortal(contextMenu, mobileMenuPortalRef.current)}
              {!isMobile && <>{contextMenu}</>}
            </div>

            <div className="flex flex-row gap-2">
              <Button variant="outline" onClick={onPreviousDay} disabled={inViewId === 0}>
                <ArrowLeft />
              </Button>

              <Button variant="outline" onClick={onHomeDay}>
                <Home />
              </Button>

              <Button variant="outline" onClick={onNextDay} disabled={inViewId === elementWindow.length - 1}>
                <ArrowRight />
              </Button>

              <span className="mr-auto" />

              {!isEditing && (
                <Button onClick={() => setIsEditing(true)}>
                  <GanttChart />
                  <span className="hidden sm:inline-block ml-2">Manage Meals</span>
                </Button>
              )}
              {isEditing && (
                <Button variant="outline" onClick={onCancelEditing}>
                  <CircleX />
                  <span className="hidden sm:inline-block ml-2">Cancel</span>
                </Button>
              )}
              {isEditing && (
                <SubmitButton>
                  <CircleCheck />
                  <span className="hidden sm:inline-block ml-2">Save</span>
                </SubmitButton>
              )}
            </div>

            <div
              ref={scrollContainerRef}
              className="snap-x snap-mandatory overflow-x-scroll whitespace-nowrap relative flex flex-row gap-2"
              style={{
                scrollbarWidth: "none",
              }}
            >
              {elementWindow.map((dist) => {
                const displayDate = viewStartDate!.plus({ days: dist });
                return (
                  <div
                    id={`entry:${dist}`}
                    key={dist.toString()}
                    className="snap-start inline-block basis-full sm:basis-[calc(50%-4px)] lg:basis-[calc(33%-0.5px)] flex-grow-0 flex-shrink-0"
                  >
                    <MealPlanItemCard
                      dayId={dist}
                      isEditing={isEditing}
                      isLoading={isLoadingMealPlanItems && !mappedMealPlanItems.mealPlanItems[dist]}
                      mealPlan={mealPlan!}
                      mealPlanItems={mappedMealPlanItems.mealPlanItems[dist] ?? {}}
                      date={displayDate}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </form>
      </Form>
    </LoadingGroup>
  );
};
