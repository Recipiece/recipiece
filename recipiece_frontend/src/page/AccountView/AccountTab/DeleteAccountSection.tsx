import { FC, useCallback, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useDeleteSelfMutation } from "../../../api";
import { Button, H3, useToast } from "../../../component";
import { DialogContext } from "../../../context";

export const DeleteAccountSection: FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { pushDialog, popDialog } = useContext(DialogContext);
  const { mutateAsync: deleteAccount } = useDeleteSelfMutation();

  const onDeleteAccount = useCallback(() => {
    pushDialog("deleteAccount", {
      onClose: () => popDialog("deleteAccount"),
      onSubmit: async () => {
        try {
          await deleteAccount();
          toast({
            title: "Account Deleted",
            description: "Your account has been successfully deleted! Thank you for using Recipiece.",
          });
          navigate("/login");
        } catch {
          toast({
            title: "Unable to Delete Account",
            description: "There was a problem deleting your account. Please try again later.",
            variant: "destructive",
          });
        } finally {
          popDialog("deleteAccount");
        }
      },
    });
  }, [deleteAccount, navigate, popDialog, pushDialog, toast]);

  return (
    <div className="flex flex-col gap-2">
      <H3>Delete Account</H3>
      <p className="text-sm">
        You can delete your account using the button below. Deleting your account will remove all of you user data from
        Recipiece.
        <b className="text-destructive"> THIS ACTION IS PERMANENT AND CANNOT BE UNDONE!</b>
      </p>
      <div className="flex flex-row justify-end">
        <Button onClick={onDeleteAccount} variant="destructive">
          Delete Account
        </Button>
      </div>
    </div>
  );
};
