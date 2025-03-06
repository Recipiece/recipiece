import { FC, useCallback, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useGetUserKitchenMembershipQuery } from "../../api";
import { H2, LoadingGroup, NotFound, Stack, Tabs, TabsContent, TabsList, TabsTrigger } from "../../component";
import { CookbookSharesTable } from "./CookbookSharesTable";
import { MealPlanSharesTable } from "./MealPlanSharesTable";
import { RecipeSharesTable } from "./RecipeSharesTable";
import { ShoppingListSharesTable } from "./ShoppingListSharesTable";

const TAB_RECIPES = "recipes";
const TAB_MEAL_PLANS = "meal_plans";
const TAB_SHOPPING_LISTS = "shopping_lists";
const TAB_COOKBOOKS = "cookbooks";

export const KitchenMembershipPage: FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { kitchenMembershipId } = useParams();
  const entityId = +kitchenMembershipId!;

  const {
    data: membership,
    isLoading: isLoadingMembership,
    isError: isMembershipError,
  } = useGetUserKitchenMembershipQuery(entityId);

  useEffect(() => {
    if (!searchParams.get("tab")) {
      setSearchParams({
        tab: TAB_RECIPES,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onTabChange = useCallback(
    (tabId: string) => {
      setSearchParams((prev) => {
        return {
          ...prev,
          tab: tabId,
        };
      });
    },
    [setSearchParams]
  );

  return (
    <LoadingGroup isLoading={isLoadingMembership} variant="skeleton" className="h-10 w-full">
      {membership && (
        <Stack>
          <H2>Shared with {membership.destination_user.username}</H2>
          <p className="text-sm">
            Below are all of the things you&apos;ve shared with {membership.destination_user.username}.
          </p>
          <Tabs defaultValue={searchParams.get("tab") ?? TAB_RECIPES} onValueChange={onTabChange}>
            <TabsList className="items-left w-full justify-start">
              <TabsTrigger value={TAB_RECIPES}>Recipes</TabsTrigger>
              <TabsTrigger value={TAB_COOKBOOKS}>Cookbooks</TabsTrigger>
              <TabsTrigger value={TAB_MEAL_PLANS}>Meal Plans</TabsTrigger>
              <TabsTrigger value={TAB_SHOPPING_LISTS}>Shopping Lists</TabsTrigger>
            </TabsList>

            <TabsContent value={TAB_RECIPES} className="pl-4 pr-4">
              <RecipeSharesTable membership={membership} />
            </TabsContent>
            <TabsContent value={TAB_COOKBOOKS} className="pl-4 pr-4">
              <CookbookSharesTable membership={membership} />
            </TabsContent>
            <TabsContent value={TAB_MEAL_PLANS} className="pl-4 pr-4">
              <MealPlanSharesTable membership={membership} />
            </TabsContent>
            <TabsContent value={TAB_SHOPPING_LISTS} className="pl-4 pr-4">
              <ShoppingListSharesTable membership={membership} />
            </TabsContent>
          </Tabs>
        </Stack>
      )}
      {isMembershipError && <NotFound backNav="/dashboard" />}
    </LoadingGroup>
  );
};
