import { RecipeShareSchema, UserKitchenMembershipSchema } from "@recipiece/types";
import { Ban, ExternalLink } from "lucide-react";
import { DateTime } from "luxon";
import { FC, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDeleteRecipeShareMutation, useListRecipeSharesQuery } from "../../api";
import { Button, LoadingGroup, Pager, useToast } from "../../component";

export const RecipeSharesTable: FC<{ readonly membership: UserKitchenMembershipSchema }> = ({ membership }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mealPlanSharesPage, setRecipeSharesPage] = useState(0);

  const { mutateAsync: deleteRecipeShare, isPending: isDeletingRecipeShare } = useDeleteRecipeShareMutation();

  const { data: mealPlanShares, isLoading: isLoadingRecipeShares } = useListRecipeSharesQuery(
    {
      user_kitchen_membership_id: membership?.id,
      from_self: true,
      page_number: mealPlanSharesPage,
    },
    {
      enabled: !!membership,
    }
  );

  const onUnshareRecipe = useCallback(
    async (share: RecipeShareSchema) => {
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
      {(mealPlanShares?.data?.length ?? 0) > 0 && (
        <>
          <div className="mb-2 mt-2 flex flex-col">
            {mealPlanShares!.data.map((share) => {
              return (
                <div className="flex flex-row gap-2 border-b-[1px] border-b-primary pb-2" key={share.id}>
                  <div className="flex flex-col">
                    <span>{share.recipe.name}</span>
                    <span className="text-xs">{DateTime.fromJSDate(share.created_at).toLocal().toLocaleString(DateTime.DATE_SHORT)}</span>
                  </div>
                  <Button size="sm" variant="link" onClick={() => navigate(`/recipe/view/${share.recipe_id}`, {})}>
                    <ExternalLink />
                  </Button>
                  <span className="ml-auto" />
                  <Button variant="ghost" onClick={() => onUnshareRecipe(share)} disabled={isDeletingRecipeShare}>
                    <Ban className="text-destructive" />
                  </Button>
                </div>
              );
            })}
          </div>
          <Pager page={mealPlanSharesPage} onPage={setRecipeSharesPage} hasNextPage={!!mealPlanShares?.has_next_page} />
        </>
      )}
      {(mealPlanShares?.data?.length ?? 0) === 0 && <p className="text-center text-sm">You haven&apos;t shared any recipes with this user.</p>}
    </LoadingGroup>
  );
};
