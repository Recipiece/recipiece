import { FC } from "react";
import { useParams } from "react-router-dom";
import { useGetUserKitchenMembershipQuery } from "../../api";
import { H2, LoadingGroup, NotFound, Stack, Tabs, TabsContent, TabsList, TabsTrigger } from "../../component";
import { RecipeSharesTable } from "./RecipeSharesTable";
import { ShoppingListSharesTable } from "./ShoppingListSharesTable";
import { MealPlanSharesTable } from "./MealPlanSharesTable";

export const KitchenMembershipPage: FC = () => {
  const { kitchenMembershipId } = useParams();
  const entityId = +kitchenMembershipId!;

  const { data: membership, isLoading: isLoadingMembership, isError: isMembershipError } = useGetUserKitchenMembershipQuery(entityId);

  return (
    <LoadingGroup isLoading={isLoadingMembership} variant="skeleton" className="h-10 w-full">
      {membership && (
        <Stack>
          <H2>Shared with {membership.destination_user.username}</H2>
          <p className="text-sm">Below are all of the things you&apos;ve shared with {membership.destination_user.username}.</p>
          <Tabs defaultValue="recipes">
            <TabsList className="items-left w-full justify-start">
              <TabsTrigger value="recipes">Recipes</TabsTrigger>
              <TabsTrigger value="mealPlans">Meal Plans</TabsTrigger>
              <TabsTrigger value="shoppingLists">Shopping Lists</TabsTrigger>
            </TabsList>

            <TabsContent value="recipes" className="pl-4 pr-4">
              <RecipeSharesTable membership={membership} />
            </TabsContent>
            <TabsContent value="mealPlans" className="pl-4 pr-4">
              <MealPlanSharesTable membership={membership} />
            </TabsContent>
            <TabsContent value="shoppingLists" className="pl-4 pr-4">
              <ShoppingListSharesTable membership={membership} />
            </TabsContent>
          </Tabs>
        </Stack>
      )}
      {isMembershipError && <NotFound backNav="/dashboard" />}
    </LoadingGroup>
  );
};
