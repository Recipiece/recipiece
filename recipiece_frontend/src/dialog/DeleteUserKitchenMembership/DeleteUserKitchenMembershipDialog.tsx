import { FC, useState } from "react";
import { useResponsiveDialogComponents } from "../../hooks";
import { BaseDialogProps } from "../BaseDialogProps";
import { UserKitchenMembership } from "../../data";
import { useGetSelfQuery } from "../../api";
import { Button } from "../../component";

export interface DeleteUserKitchenMembershipDialogProps extends BaseDialogProps<UserKitchenMembership> {
  readonly userKitchenMembership: UserKitchenMembership;
}

export const DeleteUserKitchenMembershipDialog: FC<DeleteUserKitchenMembershipDialogProps> = ({ onClose, onSubmit, userKitchenMembership }) => {
  const { ResponsiveContent, ResponsiveHeader, ResponsiveDescription, ResponsiveFooter, ResponsiveTitle } = useResponsiveDialogComponents();
  const { data: user } = useGetSelfQuery();

  const [isDisabled, setIsDisabled] = useState(false);

  const onDeleteMembership = async () => {
    setIsDisabled(true);
    onSubmit && (await onSubmit?.(userKitchenMembership));
  };

  const isTargetedUser = user?.id === userKitchenMembership.destination_user.id;

  return (
    <ResponsiveContent className="p-6">
      <ResponsiveHeader>
        <ResponsiveTitle>
          {isTargetedUser && `Leave ${userKitchenMembership.source_user.username}'s Kitchen?`}
          {!isTargetedUser && `Remove ${userKitchenMembership.destination_user.username} From Your Kitchen?`}
        </ResponsiveTitle>
        <ResponsiveDescription>
          {isTargetedUser && `You can leave ${userKitchenMembership.source_user.username}'s kitchen by selecting the Leave Kitchen button below.`}
          {!isTargetedUser && `You can remove ${userKitchenMembership.destination_user.username} from your kitchen by selecting the Remove From Kitchen button below.`}
          {" "}This will remove all shared items permanently, and cannot be undone.
        </ResponsiveDescription>
      </ResponsiveHeader>
      <ResponsiveFooter className="flex-col-reverse">
        <Button disabled={isDisabled} variant="outline" onClick={() => onClose?.()}>
          Cancel
        </Button>
        <Button disabled={isDisabled} variant="destructive" onClick={onDeleteMembership}>
          {isTargetedUser && "Leave Kitchen"}
          {!isTargetedUser && "Remove From Kitchen"}
        </Button>
      </ResponsiveFooter>
    </ResponsiveContent>
  );
};
