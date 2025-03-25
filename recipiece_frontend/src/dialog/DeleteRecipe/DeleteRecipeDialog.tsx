import { RecipeSchema } from "@recipiece/types";
import { FC, useState } from "react";
import { Button } from "../../component";
import { useResponsiveDialogComponents } from "../../hooks";
import { BaseDialogProps } from "../BaseDialogProps";

export interface DeleteRecipeDialogProps extends BaseDialogProps<RecipeSchema> {
  readonly recipe: RecipeSchema;
}

export const DeleteRecipeDialog: FC<DeleteRecipeDialogProps> = ({ recipe, onClose, onSubmit }) => {
  const [isDisabled, setIsDisabled] = useState(false);
  const { ResponsiveContent, ResponsiveHeader, ResponsiveDescription, ResponsiveFooter, ResponsiveTitle } = useResponsiveDialogComponents();

  const onDeleteRecipe = async () => {
    setIsDisabled(true);
    try {
      await Promise.resolve(onSubmit?.(recipe));
    } catch {
    } finally {
      setIsDisabled(false);
    }
  };

  return (
    <ResponsiveContent className="p-6">
      <ResponsiveHeader>
        <ResponsiveTitle>Delete {recipe.name}?</ResponsiveTitle>
        <ResponsiveDescription>
          Click the Delete Recipe button below to permanently delete <i>{recipe.name}</i>. This action is permanent and cannot be undone!
        </ResponsiveDescription>
      </ResponsiveHeader>
      <ResponsiveFooter className="flex-col-reverse">
        <Button variant="outline" disabled={isDisabled} onClick={() => onClose?.()}>
          Cancel
        </Button>
        <Button disabled={isDisabled} variant="destructive" onClick={onDeleteRecipe}>
          Delete Recipe
        </Button>
      </ResponsiveFooter>
    </ResponsiveContent>
  );
};
