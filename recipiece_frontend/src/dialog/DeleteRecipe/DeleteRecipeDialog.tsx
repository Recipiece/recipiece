import { FC, PropsWithChildren } from "react";
import { Button, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../component";
import { Recipe } from "../../data";

export interface DeleteRecipeDialogProps extends PropsWithChildren {
  readonly setIsOpen: (value: boolean) => void;
  readonly onSubmit: (recipe: Recipe) => Promise<void>;
  readonly recipe: Recipe;
  readonly disabled?: boolean;
}

export const DeleteRecipeDialog: FC<DeleteRecipeDialogProps> = ({ recipe, setIsOpen, onSubmit, disabled }) => {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Delete {recipe.name}?</DialogTitle>
        <DialogDescription>
          Click the Delete Recipe button below to permanently delete <i>{recipe.name}</i>. This action is permanent and cannot be undone!
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <div className="flex flex-row justify-end gap-2">
          <Button disabled={disabled} onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button disabled={disabled} variant="destructive" onClick={() => onSubmit(recipe)}>
            Delete Recipe
          </Button>
        </div>
      </DialogFooter>
    </DialogContent>
  );
};
