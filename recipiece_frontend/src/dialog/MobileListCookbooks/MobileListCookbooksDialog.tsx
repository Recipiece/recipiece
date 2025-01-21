import { FC, useMemo } from "react";
import { useListCookbooksQuery } from "../../api";
import { Button, LoadingGroup } from "../../component";
import { useResponsiveDialogComponents } from "../../hooks";
import { BaseDialogProps } from "../BaseDialogProps";
import { CookbookSchema, ListCookbooksQuerySchema } from "@recipiece/types";

export interface MobileListCookbooksDialogProps extends BaseDialogProps<CookbookSchema> {
  readonly excludeContainingRecipeId?: number;
}

export const MobileListCookbooksDialog: FC<MobileListCookbooksDialogProps> = ({ onSubmit, excludeContainingRecipeId }) => {
  const { ResponsiveContent, ResponsiveHeader, ResponsiveTitle } = useResponsiveDialogComponents();

  const queryFilters: ListCookbooksQuerySchema = useMemo(() => {
    const base = { page_number: 0 };
    if (excludeContainingRecipeId) {
      return {
        ...base,
        exclude_containing_recipe_id: excludeContainingRecipeId,
      };
    } else {
      return base;
    }
  }, [excludeContainingRecipeId]);

  const { data: cookbooks, isLoading: isLoadingCookbooks } = useListCookbooksQuery({
    ...queryFilters,
  });

  return (
    <ResponsiveContent className="p-6">
      <ResponsiveHeader>
        <ResponsiveTitle>Cookbooks</ResponsiveTitle>
      </ResponsiveHeader>
      <div className="grid grid-cols-1 gap-2 p-2 overflow-scroll">
        <LoadingGroup variant="spinner" isLoading={isLoadingCookbooks}>
          {(cookbooks?.data || []).map((cookbook) => {
            return (
              <Button key={cookbook.id} variant="link" onClick={() => onSubmit?.(cookbook)}>
                {cookbook.name}
              </Button>
            );
          })}
        </LoadingGroup>
      </div>
    </ResponsiveContent>
  );
};
