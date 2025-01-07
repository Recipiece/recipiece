import { Waypoints } from "lucide-react";
import { FC } from "react";
import { useGetSelfQuery, useGetUserKitchenMembershipQuery } from "../../../api";
import { Avatar, AvatarFallback, Tooltip, TooltipContent, TooltipTrigger } from "../../shadcn";

export interface SharedAvatarProps {
  readonly userKitchenMembershipId: number | undefined;
}

export const SharedAvatar: FC<SharedAvatarProps> = ({ userKitchenMembershipId }) => {
  const { data: user } = useGetSelfQuery();
  const { data: membership } = useGetUserKitchenMembershipQuery(userKitchenMembershipId as number, {
    disabled: !userKitchenMembershipId || !user,
  });

  const isMembershipTargetingSource = !!membership && !!user && membership.source_user.id === user.id;
  const isMembershipTargetingDestination = !!membership && !!user && membership.destination_user.id === user.id;

  return (
    <Tooltip>
      {isMembershipTargetingSource && (
        <TooltipTrigger asChild>
          <div className="w-8 h-8 bg-primary flex items-center justify-center text-white rounded-full">
            <Waypoints />
          </div>
        </TooltipTrigger>
      )}
      {isMembershipTargetingDestination && (
        <TooltipTrigger asChild>
          <div className="w-8 h-8">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="w-8 h-8 cursor-pointer bg-primary text-white">{membership.source_user.username.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
          </div>
        </TooltipTrigger>
      )}
      <TooltipContent>
        {isMembershipTargetingSource && "This recipe is shared with other users"}
        {isMembershipTargetingDestination && <>Shared to you by {membership.source_user.username}</>}
      </TooltipContent>
    </Tooltip>
  );
};
