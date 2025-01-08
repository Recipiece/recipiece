import { FC } from "react";
import { useParams } from "react-router-dom";
import { useGetUserKitchenMembershipQuery } from "../../api";
import { H2, LoadingGroup, Stack } from "../../component";
import { RecipeSharesTable } from "./RecipeSharesTable";
import { ShoppingListSharesTable } from "./ShoppingListSharesTable";

export const KitchenMembershipPage: FC = () => {
  const { kitchenMembershipId } = useParams();
  const entityId = +kitchenMembershipId!;

  const { data: membership, isLoading: isLoadingMembership, isError: isMembershipError } = useGetUserKitchenMembershipQuery(entityId);

  return (
    <LoadingGroup isLoading={isLoadingMembership} variant="skeleton" className="w-full h-10">
      {membership && (
        <Stack>
          <H2>Shared with {membership.destination_user.username}</H2>
          <p className="text-sm">Below are all of the things you&apos;ve shared with {membership.destination_user.username}.</p>
          <RecipeSharesTable membership={membership} />
          <ShoppingListSharesTable membership={membership} />
        </Stack>
      )}
    </LoadingGroup>
  );
};
