import { ListMealPlanSharesResponseSchema } from "@recipiece/types";
import { OctagonX } from "lucide-react";
import { FC, useCallback, useState } from "react";
import { useDeleteMealPlanShareMutation, useListMealPlanSharesQuery } from "../../api";
import { Button, LoadingGroup, Pager, useToast } from "../../component";

interface TabProps {
  readonly userKitchenMembershipId: number;
}

export const MealPlanTab: FC<TabProps> = ({ userKitchenMembershipId }) => {
  const { toast } = useToast();
  const [pageNumber, setPageNumber] = useState(0);

  const { data: sharesFromUser, isLoading: isLoadingSharesFromUser } = useListMealPlanSharesQuery({
    user_kitchen_membership_id: userKitchenMembershipId,
    page_number: pageNumber,
    from_self: true,
  });

  const { mutateAsync: unshareEntity, isPending: isUnsharingEntity } = useDeleteMealPlanShareMutation();

  const onDelete = useCallback(
    async (share: ListMealPlanSharesResponseSchema["data"][0]) => {
      try {
        await unshareEntity(share);
        toast({
          title: "Meal Plan Unshared",
          description: `${share.meal_plan.name} was unshared.`,
        });
      } catch {
        toast({
          title: "Unable to Unshare Meal Plan",
          description: `${share.meal_plan.name} could not be unshared. Try again later.`,
        });
      }
    },
    [toast, unshareEntity]
  );

  return (
    <LoadingGroup variant="spinner" className="text-center w-6 h-6" isLoading={isLoadingSharesFromUser}>
      <div className="flex flex-col gap-2">
        {sharesFromUser?.data?.length === 0 && (
          <span className="text-center">You haven&apos;t shared any meal plans with this user.</span>
        )}
        {(sharesFromUser?.data ?? []).map((share) => {
          return (
            <div key={share.id} className="flex flex-row gap-2 items-center border-b pb-2">
              <a className="underline" href={`/meal-plan/view/${share.meal_plan.id}`}>
                {share.meal_plan.name}
              </a>
              <span className="ml-auto" />
              <Button disabled={isUnsharingEntity} onClick={() => onDelete(share)} variant="destructive">
                <OctagonX /> <span className="hidden sm:ml-2 sm:block">Unshare</span>
              </Button>
            </div>
          );
        })}
        {sharesFromUser && (sharesFromUser?.data?.length ?? 0) !== 0 && (
          <Pager page={pageNumber} onPage={setPageNumber} hasNextPage={sharesFromUser.has_next_page} />
        )}
      </div>
    </LoadingGroup>
  );
};
