import { ExternalLink } from "lucide-react";
import { DateTime } from "luxon";
import { FC, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDeleteShoppingListShareMutation, useListShoppingListSharesQuery } from "../../api";
import { Button, H3, LoadingGroup, Pager, StaticTable, StaticTableBody, StaticTableHeader, StaticTableRow, useToast } from "../../component";
import { ShoppingListShare, UserKitchenMembership } from "../../data";

export const ShoppingListSharesTable: FC<{ readonly membership: UserKitchenMembership }> = ({ membership }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [shoppingListSharesPage, setShoppingListSharesPage] = useState(0);

  const { mutateAsync: deleteShoppingListShare, isPending: isDeletingShoppingListShare } = useDeleteShoppingListShareMutation();

  const { data: shoppingListShares, isLoading: isLoadingShoppingListShares } = useListShoppingListSharesQuery(
    {
      user_kitchen_membership_id: membership?.id,
      from_self: true,
      page_number: shoppingListSharesPage,
    },
    {
      enabled: !!membership,
    }
  );

  const onUnshareShoppingList = useCallback(
    async (share: ShoppingListShare) => {
      try {
        await deleteShoppingListShare(share);
        toast({
          title: "Shopping List Un-Shared",
          description: "Your shopping list has been un-shared.",
        });
      } catch {
        toast({
          title: "Unable to Un-Share Shopping List",
          description: "There was an error un-sharing your shopping list. Try again later.",
          variant: "destructive",
        });
      }
    },
    [deleteShoppingListShare, toast]
  );

  return (
    <>
      <H3>Shopping Lists</H3>
      <LoadingGroup isLoading={isLoadingShoppingListShares} variant="spinner" className="h-10 w-10">
        {(shoppingListShares?.data?.length ?? 0) > 0 && (
          <>
            <StaticTable>
              <StaticTableHeader>
                <>Shopping List</>
                <>On</>
                <>Actions</>
              </StaticTableHeader>
              <StaticTableBody>
                {shoppingListShares?.data.map((share) => {
                  return (
                    <StaticTableRow key={share.id}>
                      <div className="flex flex-row items-center">
                        {share.shopping_list.name}
                        <Button size="sm" variant="link" onClick={() => navigate(`/shopping-list/${share.shopping_list_id}`, {})}>
                          <ExternalLink />
                        </Button>
                      </div>
                      <>{DateTime.fromISO(share.created_at).toLocaleString(DateTime.DATE_SHORT)}</>
                      <>
                        <Button size="sm" variant="destructive" onClick={() => onUnshareShoppingList(share)} disabled={isDeletingShoppingListShare}>
                          Un-Share
                        </Button>
                      </>
                    </StaticTableRow>
                  );
                })}
              </StaticTableBody>
            </StaticTable>
            <Pager page={shoppingListSharesPage} onPage={setShoppingListSharesPage} hasNextPage={!!shoppingListShares?.has_next_page} />
          </>
        )}
        {(shoppingListShares?.data?.length ?? 0) === 0 && <p className="text-sm text-center">You haven&apos;t shared any shopping lists with this user.</p>}
      </LoadingGroup>
    </>
  );
};
