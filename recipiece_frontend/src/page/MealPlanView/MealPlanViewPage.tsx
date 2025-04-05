import { Constant } from "@recipiece/constant";
import { ArrowLeft, ArrowRight, CircleCheck, CircleX, GanttChart, Home } from "lucide-react";
import { DateTime } from "luxon";
import { FC, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { useBulkSetMealPlanItemsMutation, useGetMealPlanByIdQuery, useListMealPlanItemsQuery } from "../../api";
import { Button, Form, H2, LoadingGroup, RecipieceMenuBarContext, SubmitButton } from "../../component";
import { useLayout } from "../../hooks";
import { ceilDateToDay, floorDateToDay } from "../../util";
import { MealPlanContextMenu } from "./MealPlanContextMenu";
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

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [observer, setObserver] = useState<IntersectionObserver | undefined>(undefined);
  const [inViewId, setInViewId] = useState(0);
  const [debouncedInViewId, setDebouncedInViewId] = useState(0);
  const [viewStartDate, setViewStartDate] = useState<DateTime>(DateTime.utc().minus({ days: 2 }));
  const [viewEndDate, setViewEndDate] = useState<DateTime>(DateTime.utc().plus({ days: 2 }));
  const [dataArray, setDataArray] = useState<MealPlanItemsForm["mealPlanItems"] | undefined>(undefined);

  const dataStartDate = useMemo(() => viewStartDate.plus({ days: inViewId - 4 }), [viewStartDate, inViewId]);
  const dataEndDate = useMemo(() => viewStartDate.plus({ days: inViewId + 4 }), [viewStartDate, inViewId]);

  const daysSpan = useMemo(() => {
    return viewEndDate && viewStartDate ? Math.ceil(viewEndDate.diff(viewStartDate, "days").days) : 0;
  }, [viewEndDate, viewStartDate]);

  const dummyArray = useMemo(() => {
    return new Array(daysSpan).fill(undefined);
  }, [daysSpan]);

  const { mobileMenuPortalRef } = useContext(RecipieceMenuBarContext);
  const { isMobile } = useLayout();

  const { data: mealPlan, isLoading: isLoadingMealPlan } = useGetMealPlanByIdQuery(mealPlanId);
  const { data: mealPlanItems, isLoading: isLoadingMealPlanItems } = useListMealPlanItemsQuery(mealPlanId, {
    start_date: floorDateToDay(dataStartDate).toISO(),
    end_date: ceilDateToDay(dataEndDate).toISO(),
    page_number: 0,
  });
  const { mutateAsync: batchSetMealPlanItems } = useBulkSetMealPlanItemsMutation();

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

  /**
   * when the days span changes, set the data window
   * when the meal plan items change, populate in the data window
   */
  useEffect(() => {
    const baseArray = new Array(daysSpan).fill(undefined);
    if (mealPlanItems) {
      setDataArray((prev) => {
        const items = mealPlanItems.data ?? [];
        const backfilled = baseArray.map((_, idx) => {
          const offsetStart = viewStartDate.plus({ days: idx });
          if (offsetStart >= dataStartDate && offsetStart <= dataEndDate) {
            const bucketStartDate = floorDateToDay(offsetStart);
            const bucketEndDate = floorDateToDay(offsetStart).plus({ days: 1 });
            const itemsInBucket = items.filter((item) => {
              const itemStartDate = DateTime.fromJSDate(item.start_date, { zone: "UTC" });
              return bucketStartDate <= itemStartDate && itemStartDate <= bucketEndDate;
            });

            const morningItems = itemsInBucket.filter((item) => {
              const itemStartDate = DateTime.fromJSDate(item.start_date, { zone: "UTC" });
              return itemStartDate.hour < Constant.MealPlan.HOUR_OFFSET_MIDDAY;
            });
            const middayItems = itemsInBucket.filter((item) => {
              const itemStartDate = DateTime.fromJSDate(item.start_date, { zone: "UTC" });
              return Constant.MealPlan.HOUR_OFFSET_MIDDAY <= itemStartDate.hour && itemStartDate.hour < Constant.MealPlan.HOUR_OFFSET_EVENING;
            });
            const eveningItems = itemsInBucket.filter((item) => {
              const itemStartDate = DateTime.fromJSDate(item.start_date, { zone: "UTC" });
              return itemStartDate.hour >= Constant.MealPlan.HOUR_OFFSET_EVENING;
            });

            return {
              morningItems: [...morningItems].sort(mealPlanItemSorter),
              middayItems: [...middayItems].sort(mealPlanItemSorter),
              eveningItems: [...eveningItems].sort(mealPlanItemSorter),
            };
          }
          return prev?.[idx] ?? undefined;
        });
        return backfilled;
      });
    } else if (dataArray === undefined || !isLoadingMealPlanItems) {
      setDataArray(baseArray);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [daysSpan, mealPlanItems]);

  /**
   * Reset the form but keep whatever is currently being edited when we get new values
   */
  useEffect(() => {
    form.reset(
      {
        mealPlanItems: [...(dataArray ?? [])],
      },
      {
        keepDirtyValues: isEditing,
        keepValues: isEditing,
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataArray]);

  /**
   * Reset the mapped values when we change meal plan ids
   */
  useEffect(() => {
    setDataArray(undefined);
  }, [mealPlanId]);

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

  /**
   * Set up the observer when we are done loading the meal plan
   */
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoadingMealPlan]);

  /**
   * Subscribe the elements in the element window to the observer
   */
  useEffect(() => {
    if (dataArray && dataArray.length > 0) {
      dataArray
        .map((_, windowId) => {
          return document.getElementById(`entry:${windowId}`);
        })
        .forEach((val) => {
          if (val) {
            observer?.observe?.(val);
          }
        });

      return () => {
        dataArray
          .map((_, windowId) => {
            return document.getElementById(`entry:${windowId}`);
          })
          .forEach((val) => {
            if (val) {
              observer?.unobserve?.(val);
            }
          });
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataArray]);

  const onSubmit = async (formData: MealPlanItemsForm) => {
    const flatFormData: FormyMealPlanItem[] = [];
    formData.mealPlanItems
      .filter((entry) => !!entry)
      .forEach((entry) => {
        flatFormData.push(...(entry?.morningItems ?? []));
        flatFormData.push(...(entry?.middayItems ?? []));
        flatFormData.push(...(entry?.eveningItems ?? []));
      });

    const flatDataArrayData: FormyMealPlanItem[] = [];
    (dataArray ?? [])
      .filter((entry) => !!entry)
      .forEach((entry) => {
        flatDataArrayData.push(...(entry?.morningItems ?? []));
        flatDataArrayData.push(...(entry?.middayItems ?? []));
        flatDataArrayData.push(...(entry?.eveningItems ?? []));
      });

    const itemsToCreate = flatFormData.filter((item) => !item.id);
    const itemsToUpdate = flatFormData.filter((item) => {
      const matchingDataArrayItem = flatDataArrayData.find((val) => !!val.id && val.id === item.id);
      if (matchingDataArrayItem) {
        return matchingDataArrayItem["notes"] !== item["notes"] || matchingDataArrayItem["freeform_content"] !== item["freeform_content"];
      }
      return false;
    });
    const itemsToDelete = flatDataArrayData.filter((item) => {
      return !flatFormData.find((formItem) => formItem.id === item.id);
    });

    await batchSetMealPlanItems({
      mealPlanId: mealPlanId,
      create: itemsToCreate,
      // @ts-expect-error update items always have an id on them
      update: itemsToUpdate,
      // @ts-expect-error delete items always have an id on them
      delete: itemsToDelete,
    });

    setIsEditing(false);
  };

  const onCancelEditing = useCallback(() => {
    setIsEditing(false);
    form.reset({ mealPlanItems: [...(dataArray ?? [])] });
  }, [dataArray, form]);

  return (
    <LoadingGroup isLoading={isLoadingMealPlan} variant="skeleton" className="h-11 w-full sm:w-[300px]">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-2">
            <div className="flex flex-row items-center gap-2">
              <H2 className="flex-grow">{mealPlan?.name}</H2>

              {isMobile && mobileMenuPortalRef && mobileMenuPortalRef.current && createPortal(<MealPlanContextMenu mealPlan={mealPlan} />, mobileMenuPortalRef.current)}
              {!isMobile && <>{<MealPlanContextMenu mealPlan={mealPlan} />}</>}
            </div>

            <div className="flex flex-row gap-2">
              <Button variant="outline" onClick={onPreviousDay} disabled={inViewId === 0}>
                <ArrowLeft />
              </Button>

              <Button variant="outline" onClick={onHomeDay}>
                <Home />
              </Button>

              <Button variant="outline" onClick={onNextDay} disabled={inViewId === (dataArray ?? []).length - 1}>
                <ArrowRight />
              </Button>

              <span className="mr-auto" />

              {!isEditing && (
                <Button onClick={() => setIsEditing(true)}>
                  <GanttChart />
                  <span className="ml-2 hidden sm:inline-block">Manage Meals</span>
                </Button>
              )}
              {isEditing && (
                <Button variant="outline" onClick={onCancelEditing}>
                  <CircleX />
                  <span className="ml-2 hidden sm:inline-block">Cancel</span>
                </Button>
              )}
              {isEditing && (
                <SubmitButton>
                  <CircleCheck />
                  <span className="ml-2 hidden sm:inline-block">Save</span>
                </SubmitButton>
              )}
            </div>

            <div
              ref={scrollContainerRef}
              className="relative flex snap-x snap-mandatory flex-row gap-2 overflow-x-scroll whitespace-nowrap"
              style={{
                scrollbarWidth: "none",
              }}
            >
              {dummyArray.map((_, dist) => {
                const matchingDataArrayItem = dataArray?.[dist];
                const displayDate = viewStartDate!.plus({ days: dist });
                return (
                  <div
                    id={`entry:${dist}`}
                    key={dist.toString()}
                    className="inline-block flex-shrink-0 flex-grow-0 basis-full snap-start sm:basis-[calc(50%-4px)] lg:basis-[calc(33%-0.5px)]"
                  >
                    {/* Do this so that we don't flash the far left end of the view window. It's jank but like... */}
                    {daysSpan > 3 && (
                      <MealPlanItemCard dayId={dist} isEditing={isEditing} isLoading={matchingDataArrayItem === undefined} mealPlan={mealPlan!} date={displayDate} />
                    )}
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
