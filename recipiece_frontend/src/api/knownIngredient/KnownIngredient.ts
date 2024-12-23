import { useQuery } from "@tanstack/react-query";
import { KnownIngredient } from "../../data";
import { QueryArgs, useGet } from "../Request";
import { KnownIngredientQueryKeys } from "./KnownIngredientQueryKeys";

export const useListKnownIngredientsQuery = (args?: QueryArgs) => {
  const { getter } = useGet();

  const query = async () => {
    const cookbooks = await getter<never, { readonly data: KnownIngredient[] }>({
      path: "/known-ingredient/list",
      withAuth: "access_token",
    });
    return cookbooks;
  };

  return useQuery({
    queryKey: KnownIngredientQueryKeys.LIST_KNOWN_INGREDIENTS(),
    queryFn: async () => {
      try {
        const results = await query();
        return results.data;
      } catch (err) {
        throw err;
      }
    },
    enabled: args?.disabled !== true,
  });
};
