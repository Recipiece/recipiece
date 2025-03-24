import { DataTestId } from "@recipiece/constant";
import { MoreVertical, Send } from "lucide-react";
import { FC, useCallback, useContext, useState } from "react";
import { useCreateKitchenMembershipMutation } from "../../api";
import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, useToast } from "../../component";
import { DialogContext } from "../../context";
import { ExtendKitchenInvitationForm } from "../../dialog";

export const MembershipsContextMenu: FC = () => {
  const { toast } = useToast();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { pushDialog, popDialog } = useContext(DialogContext);

  const { mutateAsync: createMembership } = useCreateKitchenMembershipMutation();

  const onExtendInvitation = useCallback(() => {
    pushDialog("extendKitchenInvitation", {
      onClose: () => popDialog("extendKitchenInvitation"),
      onSubmit: async (formData: ExtendKitchenInvitationForm) => {
        try {
          await createMembership({
            username: formData.username,
          });
          toast({
            title: "Invitation Sent",
            description: `Your invitation was sent to ${formData.username}`,
            dataTestId: DataTestId.MembershipsPage.TOAST_INVITE_SENT,
          });
        } catch {
          toast({
            title: "Unable to Send Invitation",
            description: `Your invitation could not be sent to ${formData.username}. Try again later.`,
            variant: "destructive",
            dataTestId: DataTestId.MembershipsPage.TOAST_INVITE_SEND_FAILED,
          });
        } finally {
          popDialog("extendKitchenInvitation");
        }
      },
    });
  }, [createMembership, popDialog, pushDialog, toast]);

  return (
    <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
      <DropdownMenuTrigger data-testid={DataTestId.MembershipsPage.CONTEXT_MENU_TRIGGER} asChild>
        <Button variant="ghost" className="ml-auto text-primary" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <MoreVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem data-testid={DataTestId.MembershipsPage.CONTEXT_MENU_ITEM_SEND_INVITATION} onClick={onExtendInvitation}>
          <Send /> Invite
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
