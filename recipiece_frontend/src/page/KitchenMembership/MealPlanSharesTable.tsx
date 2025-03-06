import { MealPlanShareSchema, UserKitchenMembershipSchema } from "@recipiece/types";
import { Ban, ExternalLink } from "lucide-react";
import { DateTime } from "luxon";
import { FC, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDeleteMealPlanShareMutation, useListMealPlanSharesQuery } from "../../api";
import { Button, LoadingGroup, Pager, useToast } from "../../component";

export const MealPlanSharesTable: FC<{ readonly membership: UserKitchenMembershipSchema }> = ({ membership }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mealPlanSharesPage, setMealPlanSharesPage] = useState(0);
  const isShareAll = membership?.grant_level === "ALL";

  const { mutateAsync: deleteMealPlanShare, isPending: isDeletingMealPlanShare } = useDeleteMealPlanShareMutation();

  const { data: mealPlanShares, isLoading: isLoadingMealPlanShares } = useListMealPlanSharesQuery(
    {
      user_kitchen_membership_id: membership?.id,
      from_self: true,
      page_number: mealPlanSharesPage,
    },
    {
      enabled: !!membership && !isShareAll,
    }
  );

  const hasNoShares = membership?.grant_level === "SELECTIVE" && (mealPlanShares?.data?.length ?? 0) === 0;

  const onUnshareMealPlan = useCallback(
    async (share: MealPlanShareSchema) => {
      try {
        await deleteMealPlanShare(share);
        toast({
          title: "Meal Plan Un-Shared",
          description: "Your meal plan has been un-shared.",
        });
      } catch {
        toast({
          title: "Unable to Un-Share Meal Plan",
          description: "There was an error un-sharing your meal plan. Try again later.",
          variant: "destructive",
        });
      }
    },
    [deleteMealPlanShare, toast]
  );

  return (
    <>
      {isShareAll && <p className="text-center text-sm">You&apos;re sharing everything with this user.</p>}
      <LoadingGroup isLoading={!isShareAll && isLoadingMealPlanShares} variant="spinner" className="h-10 w-10">
        {(mealPlanShares?.data?.length ?? 0) > 0 && (
          <>
            <div className="mb-2 mt-2 flex flex-col">
              {mealPlanShares!.data.map((share) => {
                return (
                  <div className="flex flex-row gap-2 border-b-[1px] border-b-primary pb-2" key={share.id}>
                    <div className="flex flex-col">
                      <span>{share.meal_plan.name}</span>
                      <span className="text-xs">
                        {DateTime.fromJSDate(share.created_at).toLocal().toLocaleString(DateTime.DATE_SHORT)}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="link"
                      onClick={() => navigate(`/meal-plan/view/${share.meal_plan_id}`, {})}
                    >
                      <ExternalLink />
                    </Button>
                    <span className="ml-auto" />
                    <Button variant="ghost" onClick={() => onUnshareMealPlan(share)} disabled={isDeletingMealPlanShare}>
                      <Ban className="text-destructive" />
                    </Button>
                  </div>
                );
              })}
            </div>
            <Pager
              page={mealPlanSharesPage}
              onPage={setMealPlanSharesPage}
              hasNextPage={!!mealPlanShares?.has_next_page}
            />
          </>
        )}
        {hasNoShares && <p className="text-center text-sm">You haven&apos;t shared any meal plans with this user.</p>}
      </LoadingGroup>
    </>
  );
};
