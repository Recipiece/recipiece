import { RcpQueryKey } from "../QueryKeys";

export class KnownIngredientQueryKeys {
  public static readonly LIST_KNOWN_INGREDIENTS = (): RcpQueryKey => {
    return ["listKnownIngredients"];
  };
}
