import { CookbookShareSchema, UserKitchenMembershipSchema } from "@recipiece/types";
import { Ban, ExternalLink } from "lucide-react";
import { DateTime } from "luxon";
import { FC, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDeleteCookbookShareMutation, useListCookbookSharesQuery } from "../../api";
import { Button, LoadingGroup, Pager, useToast } from "../../component";

export const CookbookSharesTable: FC<{ readonly membership: UserKitchenMembershipSchema }> = ({ membership }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [cookbookSharesPage, setCookbookSharesPage] = useState(0);
  const isShareAll = membership?.grant_level === "ALL";

  const { mutateAsync: deleteCookbookShare, isPending: isDeletingCookbookShare } = useDeleteCookbookShareMutation();

  const { data: cookbookShares, isLoading: isLoadingCookbookShares } = useListCookbookSharesQuery(
    {
      user_kitchen_membership_id: membership?.id,
      from_self: true,
      page_number: cookbookSharesPage,
    },
    {
      enabled: !isShareAll && !!membership,
    }
  );

  const hasNoShares = membership?.grant_level === "SELECTIVE" && (cookbookShares?.data?.length ?? 0) === 0;

  const onUnshareCookbook = useCallback(
    async (share: CookbookShareSchema) => {
      try {
        await deleteCookbookShare(share);
        toast({
          title: "Cookbook Un-Shared",
          description: "Your cookbook has been un-shared.",
        });
      } catch {
        toast({
          title: "Unable to Un-Share Cookbook",
          description: "There was an error un-sharing your cookbook. Try again later.",
          variant: "destructive",
        });
      }
    },
    [deleteCookbookShare, toast]
  );

  return (
    <>
      {isShareAll && <p className="text-center text-sm">You&apos;re sharing everything with this user.</p>}
      <LoadingGroup isLoading={!isShareAll && isLoadingCookbookShares} variant="spinner" className="h-10 w-10">
        {(cookbookShares?.data?.length ?? 0) > 0 && (
          <>
            <div className="mb-2 mt-2 flex flex-col">
              {cookbookShares!.data.map((share) => {
                return (
                  <div className="flex flex-row gap-2 border-b-[1px] border-b-primary pb-2" key={share.id}>
                    <div className="flex flex-col">
                      <span>{share.cookbook.name}</span>
                      <span className="text-xs">{DateTime.fromJSDate(share.created_at).toLocal().toLocaleString(DateTime.DATE_SHORT)}</span>
                    </div>
                    <Button size="sm" variant="link" onClick={() => navigate(`/cookbook/${share.cookbook_id}`, {})}>
                      <ExternalLink />
                    </Button>
                    <span className="ml-auto" />
                    <Button variant="ghost" onClick={() => onUnshareCookbook(share)} disabled={isDeletingCookbookShare}>
                      <Ban className="text-destructive" />
                    </Button>
                  </div>
                );
              })}
            </div>
            <Pager page={cookbookSharesPage} onPage={setCookbookSharesPage} hasNextPage={!!cookbookShares?.has_next_page} />
          </>
        )}
        {hasNoShares && <p className="text-center text-sm">You haven&apos;t shared any cookbooks with this user.</p>}
      </LoadingGroup>
    </>
  );
};
