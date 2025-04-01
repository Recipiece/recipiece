import { UserKitchenMembershipSchema } from "@recipiece/types";
import { MoreVertical, X } from "lucide-react";
import { FC, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDeleteUserKitchenMembershipMutation } from "../../api";
import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, useToast } from "../../component";
import { DialogContext } from "../../context";

export const MembershipContextMenu: FC<{ readonly membership: UserKitchenMembershipSchema }> = ({ membership }) => {
  const { pushDialog, popDialog } = useContext(DialogContext);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const { mutateAsync: deleteUserKitchenMembership } = useDeleteUserKitchenMembershipMutation();

  const onRemoveFromKitchen = async () => {
    pushDialog("deleteUserKitchenMembership", {
      userKitchenMembership: membership,
      onClose: () => popDialog("deleteUserKitchenMembership"),
      onSubmit: async () => {
        try {
          await deleteUserKitchenMembership(membership);
          navigate("/memberships");
          toast({
            title: "Kitchen Left",
            description: "You have left this kitchen.",
          });
        } catch {
          toast({
            title: "Unable to Leave Kitchen",
            description: "There was an error leaving this kitchen. Try again later.",
            variant: "destructive",
          });
        } finally {
          popDialog("deleteUserKitchenMembership");
        }
      },
    });
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="ml-auto text-primary" onClick={() => setIsOpen(!isOpen)}>
          <MoreVertical />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        <DropdownMenuItem onClick={onRemoveFromKitchen} className="text-destructive">
          <X /> Leave Kitchen
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
