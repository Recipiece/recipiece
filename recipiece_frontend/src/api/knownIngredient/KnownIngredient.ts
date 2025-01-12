import { useQuery } from "@tanstack/react-query";
import { ListKnownIngredientsResponse } from "../../data";
import { QueryArgs, useGet } from "../Request";
import { KnownIngredientQueryKeys } from "./KnownIngredientQueryKeys";

export const useListKnownIngredientsQuery = (args?: QueryArgs<ListKnownIngredientsResponse>) => {
  const { getter } = useGet();

  const query = async () => {
    const response = await getter<never, ListKnownIngredientsResponse>({
      path: "/known-ingredient/list",
      withAuth: "access_token",
    });
    return response.data;
  };

  return useQuery({
    queryKey: KnownIngredientQueryKeys.LIST_KNOWN_INGREDIENTS(),
    queryFn: query,
    ...(args ?? {}),
  });
};
