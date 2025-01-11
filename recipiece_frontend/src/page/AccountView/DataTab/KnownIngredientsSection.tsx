import { FC } from "react";
import { useListKnownIngredientsQuery } from "../../../api";
import { H3, InlineCode, LoadingGroup, Stack, StaticTable, StaticTableBody, StaticTableHeader, StaticTableRow } from "../../../component";

export const KnownIngredientsSection: FC = () => {
  const { data: knownIngredients, isLoading: isLoadingKnownIngredients } = useListKnownIngredientsQuery();

  return (
    <Stack>
      <H3>Ingredient Conversions</H3>
      <p className="text-sm">
        Recipiece maintains a list of volume to weight conversions for common ingredients. When converting ingredients, Recipiece will use the base unit of either grams or U.S.
        cups to traverse from volume to weight as vice versa. For ingredients that are often listed without units (eggs, for example), Recipiece will use the value in the{" "}
        <InlineCode>unitless</InlineCode> column to make the conversion.
      </p>
      <LoadingGroup isLoading={isLoadingKnownIngredients}>
        <StaticTable>
          <StaticTableHeader>
            <>Ingredient</>
            <>Grams</>
            <>U.S. Cups</>
            <>Unitless</>
          </StaticTableHeader>

          <StaticTableBody>
            {knownIngredients?.data?.map((ki) => {
              return (
                <StaticTableRow key={ki.id}>
                  <>{ki.ingredient_name}</>
                  <>{ki.grams ?? "--"} grams</>
                  <>{ki.us_cups} cups</>
                  <>{ki.unitless_amount ?? "--"}</>
                </StaticTableRow>
              );
            })}
          </StaticTableBody>
        </StaticTable>
      </LoadingGroup>
    </Stack>
  );
};
