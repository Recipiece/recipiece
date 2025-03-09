import { UserKitchenMembershipSchema } from "@recipiece/types";
import { MoreVertical, Share2 } from "lucide-react";
import { FC, useState } from "react";
import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../component";

export interface KitchenMembershipContextMenuProps {
  readonly membership: UserKitchenMembershipSchema;
  readonly onEdit: (membership: UserKitchenMembershipSchema) => void;
}

export const KitchenMembershipContextMenu: FC<KitchenMembershipContextMenuProps> = ({ membership, onEdit }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="ml-auto text-primary" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <MoreVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => onEdit(membership)}>
          <Share2 /> Manage Access
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
