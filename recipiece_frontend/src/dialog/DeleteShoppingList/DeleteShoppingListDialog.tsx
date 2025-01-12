import { FC, useState } from "react";
import { Button } from "../../component";
import { ShoppingList } from "../../data";
import { useResponsiveDialogComponents } from "../../hooks";
import { BaseDialogProps } from "../BaseDialogProps";

export interface DeleteShoppingListDialogProps extends BaseDialogProps<ShoppingList> {
  readonly shoppingList: ShoppingList;
}

export const DeleteShoppingListDialog: FC<DeleteShoppingListDialogProps> = ({ shoppingList, onClose, onSubmit }) => {
  const { ResponsiveContent, ResponsiveHeader, ResponsiveDescription, ResponsiveFooter, ResponsiveTitle } = useResponsiveDialogComponents();
  const [isDisabled, setIsDisabled] = useState(false);

  const onDeleteShoppingList = async () => {
    setIsDisabled(true);
    try {
      await Promise.resolve(onSubmit?.(shoppingList));
    } catch {
    } finally {
      setIsDisabled(false);
    }
  };

  return (
    <ResponsiveContent className="p-6">
      <ResponsiveHeader>
        <ResponsiveTitle>Delete {shoppingList.name}?</ResponsiveTitle>
        <ResponsiveDescription>
          Click the Delete Shopping List button below to permanently delete <i>{shoppingList.name}</i>. This action is permanent and cannot be undone!
        </ResponsiveDescription>
      </ResponsiveHeader>
      <ResponsiveFooter className="flex-col-reverse">
        <Button disabled={isDisabled} variant="outline" onClick={() => onClose?.()}>
          Cancel
        </Button>
        <Button disabled={isDisabled} variant="destructive" onClick={onDeleteShoppingList}>
          Delete Shopping List
        </Button>
      </ResponsiveFooter>
    </ResponsiveContent>
  );
};
