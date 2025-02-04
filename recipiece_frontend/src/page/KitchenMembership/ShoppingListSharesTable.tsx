import { ShoppingListShareSchema, UserKitchenMembershipSchema } from "@recipiece/types";
import { Ban, ExternalLink } from "lucide-react";
import { DateTime } from "luxon";
import { FC, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDeleteShoppingListShareMutation, useListShoppingListSharesQuery } from "../../api";
import { Button, LoadingGroup, Pager, useToast } from "../../component";

export const ShoppingListSharesTable: FC<{ readonly membership: UserKitchenMembershipSchema }> = ({ membership }) => {
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
    async (share: ShoppingListShareSchema) => {
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
    <LoadingGroup isLoading={isLoadingShoppingListShares} variant="spinner" className="h-10 w-10">
      {(shoppingListShares?.data?.length ?? 0) > 0 && (
        <>
          <div className="mb-2 mt-2 flex flex-col">
            {shoppingListShares!.data.map((share) => {
              return (
                <div className="flex flex-row gap-2 border-b-[1px] border-b-primary pb-2" key={share.id}>
                  <div className="flex flex-col">
                    <span>{share.shopping_list.name}</span>
                    <span className="text-xs">{DateTime.fromJSDate(share.created_at).toLocal().toLocaleString(DateTime.DATE_SHORT)}</span>
                  </div>
                  <Button size="sm" variant="link" onClick={() => navigate(`/shopping-list/${share.shopping_list_id}`, {})}>
                    <ExternalLink />
                  </Button>
                  <span className="ml-auto" />
                  <Button variant="ghost" onClick={() => onUnshareShoppingList(share)} disabled={isDeletingShoppingListShare}>
                    <Ban className="text-destructive" />
                  </Button>
                </div>
              );
            })}
          </div>
          <Pager page={shoppingListSharesPage} onPage={setShoppingListSharesPage} hasNextPage={!!shoppingListShares?.has_next_page} />
        </>
      )}
      {(shoppingListShares?.data?.length ?? 0) === 0 && <p className="text-center text-sm">You haven&apos;t shared any shopping lists with this user.</p>}
    </LoadingGroup>
  );
};
