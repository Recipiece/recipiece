import { FC, useState } from "react";
import { useListMealPlanSharesQuery } from "../../api";
import { LoadingGroup, Pager } from "../../component";

interface TabProps {
  readonly userKitchenMembershipId: number;
}

export const MealPlanTab: FC<TabProps> = ({ userKitchenMembershipId }) => {
  const [pageNumber, setPageNumber] = useState(0);

  const { data: shares, isLoading: isLoadingShares } = useListMealPlanSharesQuery({
    user_kitchen_membership_id: userKitchenMembershipId,
    page_number: pageNumber,
    from_self: true,
  });

  return (
    <LoadingGroup variant="spinner" className="text-center w-4 h-4" isLoading={isLoadingShares}>
      <div className="flex flex-col gap-2">
        {(shares?.data ?? []).map((share) => {
          return (
            <div key={share.id}>
              
            </div>
          )
        })}
        {shares && <Pager page={pageNumber} onPage={setPageNumber} hasNextPage={shares.has_next_page} />}
      </div>
    </LoadingGroup>
  );
};
