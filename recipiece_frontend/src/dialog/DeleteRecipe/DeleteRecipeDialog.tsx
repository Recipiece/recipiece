import { FC, useState } from "react";
import { Button, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../component";
import { Recipe } from "../../data";
import { BaseDialogProps } from "../BaseDialogProps";

export interface DeleteRecipeDialogProps extends BaseDialogProps<Recipe> {
  readonly recipe: Recipe;
}

export const DeleteRecipeDialog: FC<DeleteRecipeDialogProps> = ({ recipe, onClose, onSubmit }) => {
  const [isDisabled, setIsDisabled] = useState(false);

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
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Delete {recipe.name}?</DialogTitle>
        <DialogDescription>
          Click the Delete Recipe button below to permanently delete <i>{recipe.name}</i>. This action is permanent and cannot be undone!
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant="outline" disabled={isDisabled} onClick={() => onClose?.()}>
          Cancel
        </Button>
        <Button disabled={isDisabled} variant="destructive" onClick={onDeleteRecipe}>
          Delete Recipe
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};
