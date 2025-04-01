import { ListShoppingListSharesResponseSchema } from "@recipiece/types";
import { OctagonX } from "lucide-react";
import { FC, useCallback, useState } from "react";
import { useDeleteShoppingListShareMutation, useListShoppingListSharesQuery } from "../../api";
import { Button, LoadingGroup, Pager, useToast } from "../../component";

interface TabProps {
  readonly userKitchenMembershipId: number;
}

export const ShoppingListTab: FC<TabProps> = ({ userKitchenMembershipId }) => {
  const { toast } = useToast();
  const [pageNumber, setPageNumber] = useState(0);

  const { data: sharesFromUser, isLoading: isLoadingSharesFromUser } = useListShoppingListSharesQuery({
    user_kitchen_membership_id: userKitchenMembershipId,
    page_number: pageNumber,
    from_self: true,
  });

  const { mutateAsync: unshareEntity, isPending: isUnsharingEntity } = useDeleteShoppingListShareMutation();

  const onDelete = useCallback(
    async (share: ListShoppingListSharesResponseSchema["data"][0]) => {
      try {
        await unshareEntity(share);
        toast({
          title: "Shopping List Unshared",
          description: `${share.shopping_list.name} was unshared.`,
        });
      } catch {
        toast({
          title: "Unable to Unshare Shopping List",
          description: `${share.shopping_list.name} could not be unshared. Try again later.`,
        });
      }
    },
    [toast, unshareEntity]
  );

  return (
    <LoadingGroup variant="spinner" className="text-center w-6 h-6" isLoading={isLoadingSharesFromUser}>
      <div className="flex flex-col gap-2">
        {sharesFromUser?.data?.length === 0 && <span className="text-center">You haven&apos;t shared any shopping lists with this user.</span>}
        {(sharesFromUser?.data ?? []).map((share) => {
          return (
            <div key={share.id} className="flex flex-row gap-2 items-center border-b pb-2">
              <a className="underline" href={`/shopping-list/${share.shopping_list.id}`}>
                {share.shopping_list.name}
              </a>
              <span className="ml-auto" />
              <Button disabled={isUnsharingEntity} onClick={() => onDelete(share)} variant="destructive">
                <OctagonX /> <span className="hidden sm:ml-2 sm:block">Unshare</span>
              </Button>
            </div>
          );
        })}
        {sharesFromUser && (sharesFromUser?.data?.length ?? 0) !== 0 && <Pager page={pageNumber} onPage={setPageNumber} hasNextPage={sharesFromUser.has_next_page} />}
      </div>
    </LoadingGroup>
  );
};
