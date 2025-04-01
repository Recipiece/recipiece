import { ListKnownIngredientsResponseSchema, YListKnownIngredientsResponseSchema } from "@recipiece/types";
import { useQuery } from "@tanstack/react-query";
import { QueryArgs, useGet } from "../Request";
import { KnownIngredientQueryKeys } from "./KnownIngredientQueryKeys";

export const useListKnownIngredientsQuery = (args?: QueryArgs<ListKnownIngredientsResponseSchema>) => {
  const { getter } = useGet();

  const query = async () => {
    const response = await getter<never, ListKnownIngredientsResponseSchema>({
      path: "/known-ingredient/list",
      withAuth: "access_token",
    });
    return YListKnownIngredientsResponseSchema.cast(response.data);
  };

  return useQuery({
    queryKey: KnownIngredientQueryKeys.LIST_KNOWN_INGREDIENTS(),
    queryFn: query,
    ...(args ?? {}),
  });
};
