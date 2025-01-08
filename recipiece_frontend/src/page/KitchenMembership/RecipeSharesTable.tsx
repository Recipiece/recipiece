import { FC, useCallback, useState } from "react";
import { RecipeShare, UserKitchenMembership } from "../../data";
import { useDeleteRecipeShareMutation, useListRecipeSharesQuery } from "../../api";
import { Button, LoadingGroup, Pager, StaticTable, StaticTableBody, StaticTableHeader, StaticTableRow, useToast } from "../../component";
import { ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DateTime } from "luxon";

export const RecipeSharesTable: FC<{ readonly membership: UserKitchenMembership }> = ({ membership }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [recipeSharesPage, setRecipeSharesPage] = useState(0);

  const { mutateAsync: deleteRecipeShare } = useDeleteRecipeShareMutation();

  const { data: recipeShares, isLoading: isLoadingRecipeShares } = useListRecipeSharesQuery(
    {
      user_kitchen_membership_id: membership?.id,
      from_self: true,
      page_number: recipeSharesPage,
    },
    {
      enabled: !!membership,
    }
  );

  const onUnshareRecipe = useCallback(
    async (share: RecipeShare) => {
      try {
        await deleteRecipeShare(share);
        toast({
          title: "Recipe Un-Shared",
          description: "Your recipe has been un-shared.",
        });
      } catch {
        toast({
          title: "Unable to Un-Share Recipe",
          description: "There was an error un-sharing your recipe. Try again later.",
          variant: "destructive",
        });
      }
    },
    [deleteRecipeShare, toast]
  );

  return (
    <LoadingGroup isLoading={isLoadingRecipeShares} variant="spinner" className="h-10 w-10">
      {(recipeShares?.data?.length ?? 0) > 0 && (
        <>
          <StaticTable>
            <StaticTableHeader>
              <>Recipe</>
              <>On</>
              <>Actions</>
            </StaticTableHeader>
            <StaticTableBody>
              {recipeShares?.data.map((share) => {
                return (
                  <StaticTableRow key={share.id}>
                    <div className="flex flex-row items-center">
                      {share.recipe.name}
                      <Button size="sm" variant="link" onClick={() => navigate(`/recipe/view/${share.recipe_id}`, {})}>
                        <ExternalLink />
                      </Button>
                    </div>
                    <>{DateTime.fromISO(share.created_at).toLocaleString(DateTime.DATE_SHORT)}</>
                    <>
                      <Button size="sm" variant="destructive" onClick={() => onUnshareRecipe(share)}>
                        Un-Share
                      </Button>
                    </>
                  </StaticTableRow>
                );
              })}
            </StaticTableBody>
          </StaticTable>
          <Pager page={recipeSharesPage} onPage={setRecipeSharesPage} hasNextPage={!!recipeShares?.has_next_page} />
        </>
      )}
      {(recipeShares?.data?.length ?? 0) === 0 && <p className="text-sm text-center">You haven&apos;t shared any recipes with this user.</p>}
    </LoadingGroup>
  );
};
