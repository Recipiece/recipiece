import { UserKitchenMembershipSchema } from "@recipiece/types";
import { FC, useState } from "react";
import { useGetSelfQuery } from "../../api";
import { Button } from "../../component";
import { useResponsiveDialogComponents } from "../../hooks";
import { BaseDialogProps } from "../BaseDialogProps";

export interface DeleteUserKitchenMembershipDialogProps extends BaseDialogProps<UserKitchenMembershipSchema> {
  readonly userKitchenMembership: UserKitchenMembershipSchema;
}

export const DeleteUserKitchenMembershipDialog: FC<DeleteUserKitchenMembershipDialogProps> = ({
  onClose,
  onSubmit,
  userKitchenMembership,
}) => {
  const { ResponsiveContent, ResponsiveHeader, ResponsiveDescription, ResponsiveFooter, ResponsiveTitle } =
    useResponsiveDialogComponents();
  const { data: user } = useGetSelfQuery();

  const [isDisabled, setIsDisabled] = useState(false);

  const onDeleteMembership = async () => {
    setIsDisabled(true);
    try {
      await onSubmit?.(userKitchenMembership);
    } finally {
      setIsDisabled(false);
    }
  };

  const username =
    user?.id === userKitchenMembership?.source_user?.id
      ? userKitchenMembership.destination_user.username
      : userKitchenMembership.source_user.username;

  return (
    <ResponsiveContent className="p-6">
      <ResponsiveHeader>
        <ResponsiveTitle>Leave {username}&apos;s Kitchen?</ResponsiveTitle>
        <ResponsiveDescription>
          Click the Leave Kitchen button below to leave {username}&apos;s kitchen. This will remove all shared items,
          and cannot be undone.
        </ResponsiveDescription>
      </ResponsiveHeader>
      <ResponsiveFooter className="flex-col-reverse">
        <Button disabled={isDisabled} variant="outline" onClick={() => onClose?.()}>
          Cancel
        </Button>
        <Button disabled={isDisabled} variant="destructive" onClick={onDeleteMembership}>
          Leave Kitchen
        </Button>
      </ResponsiveFooter>
    </ResponsiveContent>
  );
};
