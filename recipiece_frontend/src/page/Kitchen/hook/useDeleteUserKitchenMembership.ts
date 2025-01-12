import { useCallback, useContext } from "react";
import { useDeleteUserKitchenMembershipMutation, useGetSelfQuery } from "../../../api";
import { DialogContext } from "../../../context";
import { UserKitchenMembership } from "../../../data";
import { useToast } from "../../../component";

export const useDeleteUserKitchenMembershipDialog = (deletionContext: "source_user" | "destination_user") => {
  const { toast } = useToast();
  const { pushDialog, popDialog } = useContext(DialogContext);

  const { data: user } = useGetSelfQuery();
  const { mutateAsync: deleteMembershipMutation, isPending: isDeletingUserKitchenMembership } = useDeleteUserKitchenMembershipMutation(deletionContext);

  const deleteUserKitchenMembership = useCallback(async (userKitchenMembership: UserKitchenMembership) => {
    const runDelete = async () => {
      try {
        await deleteMembershipMutation(userKitchenMembership);
        const isTargetingUser = user?.id === userKitchenMembership.destination_user.id;
        toast({
          title: isTargetingUser ? "Left Kitchen" : "Removed From Kitchen",
          description: isTargetingUser
            ? `You have left ${userKitchenMembership.source_user.username}'s kitchen`
            : `${userKitchenMembership.destination_user.username} has been removed from your kitchen`,
        });
      } catch {
        toast({
          title: "Unable to Modify Kitchen",
          description: "This kitchen membership could not be modified. Try again later.",
          variant: "destructive",
        });
      } finally {
        popDialog("deleteUserKitchenMembership");
      }
    };

    if (userKitchenMembership.status === "accepted") {
      pushDialog("deleteUserKitchenMembership", {
        userKitchenMembership: userKitchenMembership,
        onClose: () => popDialog("deleteUserKitchenMembership"),
        onSubmit: runDelete,
      });
    } else {
      await runDelete();
    }
  }, [deleteMembershipMutation, popDialog, pushDialog, toast, user]);

  return {
    deleteUserKitchenMembership,
    isDeletingUserKitchenMembership,
  }
};
