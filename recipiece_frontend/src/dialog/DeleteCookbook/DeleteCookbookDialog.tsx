import { CookbookSchema } from "@recipiece/types";
import { FC } from "react";
import { Button } from "../../component";
import { useResponsiveDialogComponents } from "../../hooks";
import { BaseDialogProps } from "../BaseDialogProps";

export interface DeleteCookbookDialogProps extends BaseDialogProps<CookbookSchema> {
  readonly cookbook: CookbookSchema;
}

export const DeleteCookbookDialog: FC<DeleteCookbookDialogProps> = ({ cookbook, onClose, onSubmit }) => {
  const { ResponsiveContent, ResponsiveHeader, ResponsiveDescription, ResponsiveFooter, ResponsiveTitle } = useResponsiveDialogComponents();

  return (
    <ResponsiveContent className="p-6">
      <ResponsiveHeader>
        <ResponsiveTitle>Delete {cookbook.name}?</ResponsiveTitle>
        <ResponsiveDescription>
          Click the Delete Cookbook button below to permanently delete <i>{cookbook.name}</i>. This action is permanent and cannot be undone!
        </ResponsiveDescription>
      </ResponsiveHeader>
      <ResponsiveFooter className="flex-col-reverse">
        <Button variant="outline" onClick={() => onClose?.()}>
          Cancel
        </Button>
        <Button variant="destructive" onClick={() => onSubmit?.(cookbook)}>
          Delete Cookbook
        </Button>
      </ResponsiveFooter>
    </ResponsiveContent>
  );
};
