import { Waypoints } from "lucide-react";
import { FC } from "react";
import { useGetSelfQuery, useGetUserKitchenMembershipQuery } from "../../../api";
import { Avatar, AvatarFallback, Tooltip, TooltipContent, TooltipTrigger } from "../../shadcn";
import { cn } from "../../../util";

export interface SharedAvatarProps {
  readonly userKitchenMembershipId: number | undefined;
  readonly size?: "small" | "medium" | "large";
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
}

export const SharedAvatar: FC<SharedAvatarProps> = ({ userKitchenMembershipId, size = "medium" }) => {
  const { data: user } = useGetSelfQuery();
  const { data: membership } = useGetUserKitchenMembershipQuery(userKitchenMembershipId as number, {
    enabled: !!userKitchenMembershipId && !!user,
  });

  const isMembershipTargetingSource = !!membership && !!user && membership.source_user.id === user.id;
  const isMembershipTargetingDestination = !!membership && !!user && membership.destination_user.id === user.id;

  return (
    <Tooltip>
      {isMembershipTargetingSource && (
        <TooltipTrigger asChild>
          <div className={cn(W_H_SIZES[size], "bg-primary flex items-center justify-center text-white rounded-full")}>
            <Waypoints size={ICON_SIZES[size]}/>
          </div>
        </TooltipTrigger>
      )}
      {isMembershipTargetingDestination && (
        <TooltipTrigger asChild>
          <div className={W_H_SIZES[size]}>
            <Avatar className={W_H_SIZES[size]}>
              <AvatarFallback className={cn(W_H_SIZES[size], "cursor-pointer bg-primary text-white")}>{membership.source_user.username.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
          </div>
        </TooltipTrigger>
      )}
      <TooltipContent>
        {isMembershipTargetingSource && "Shared with other users"}
        {isMembershipTargetingDestination && <>Shared to you by {membership.source_user.username}</>}
      </TooltipContent>
    </Tooltip>
  );
};
