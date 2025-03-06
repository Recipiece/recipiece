import { DataTestId } from "@recipiece/constant";
import { Waypoints } from "lucide-react";
import { FC } from "react";
import { useGetSelfQuery, useGetUserKitchenMembershipQuery } from "../../../api";
import { cn } from "../../../util";
import { Avatar, AvatarFallback, Tooltip, TooltipContent, TooltipTrigger } from "../../shadcn";

export interface SharedAvatarProps {
  readonly userKitchenMembershipId: number | undefined;
  readonly size?: "small" | "medium" | "large";
  readonly dataTestId?: string;
}

const W_H_SIZES = {
  small: "w-4 h-4 text-xs",
  medium: "w-8 h-8",
  large: "w-10 h-10",
};

const ICON_SIZES = {
  small: 10,
  medium: 20,
  large: 36,
};

export const SharedAvatar: FC<SharedAvatarProps> = ({ userKitchenMembershipId, dataTestId, size = "medium" }) => {
  const { data: user } = useGetSelfQuery();
  const { data: membership } = useGetUserKitchenMembershipQuery(userKitchenMembershipId as number, {
    enabled: !!userKitchenMembershipId && !!user,
  });

  const isMembershipTargetingSource = !!membership && !!user && membership.source_user.id === user.id;
  const isMembershipTargetingDestination = !!membership && !!user && membership.destination_user.id === user.id;

  return (
    <Tooltip data-testid={DataTestId.SharedAvatar.TOOLTIP_CONTAINER(dataTestId)}>
      {isMembershipTargetingSource && (
        <TooltipTrigger asChild>
          <div
            data-testid={DataTestId.SharedAvatar.TOOLTIP_TRIGGER}
            className={cn(W_H_SIZES[size], "flex items-center justify-center rounded-full bg-primary text-white")}
          >
            <Waypoints size={ICON_SIZES[size]} />
          </div>
        </TooltipTrigger>
      )}
      {isMembershipTargetingDestination && (
        <TooltipTrigger asChild>
          <div data-testid={DataTestId.SharedAvatar.TOOLTIP_TRIGGER} className={W_H_SIZES[size]}>
            <Avatar className={W_H_SIZES[size]}>
              <AvatarFallback className={cn(W_H_SIZES[size], "cursor-pointer bg-primary text-white")}>
                {membership.source_user.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </TooltipTrigger>
      )}
      <TooltipContent data-testid={DataTestId.SharedAvatar.TOOLTIP_CONTENT}>
        {isMembershipTargetingSource && "Shared with other users"}
        {isMembershipTargetingDestination && <>Shared to you by {membership.source_user.username}</>}
      </TooltipContent>
    </Tooltip>
  );
};
