import { FC, useMemo } from "react";
import { useGetSelfQuery, useGetUserKitchenMembershipQuery } from "../../../api";
import { cn } from "../../../util";
import { Avatar, AvatarFallback, Tooltip, TooltipContent, TooltipTrigger } from "../../shadcn";
import { LoadingGroup } from "../LoadingGroup";

export interface MembershipAvatarProps {
  readonly membershipId?: number | null;
  readonly size?: "small" | "medium" | "large";
}

const SIZE_CLASSNAME_MAP = {
  small: "w-6 h-6 text-sm",
  medium: "w-8 h-8",
  large: "w-10 h-10 text-lg",
};

export const MembershipAvatar: FC<MembershipAvatarProps> = ({ membershipId, size = "medium" }) => {
  const isValidMembershipId = !!membershipId && membershipId !== -1
  const { data: membership, isLoading: isLoadingMembership } = useGetUserKitchenMembershipQuery(membershipId ?? -1, {
    enabled: isValidMembershipId,
  });

  const { data: user, isLoading: isLoadingUser } = useGetSelfQuery();

  const owner = useMemo(() => {
    if (user && membership) {
      let token = "";
      if (user.id === membership.source_user.id) {
        token = membership.destination_user.username;
      } else {
        token = membership.source_user.username;
      }
      return token;
    }
    return "";
  }, [user, membership]);

  return (
    <>
      {isValidMembershipId && (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={SIZE_CLASSNAME_MAP[size]}>
              <Avatar className={SIZE_CLASSNAME_MAP[size]}>
                <AvatarFallback className={cn(SIZE_CLASSNAME_MAP[size], "cursor-pointer bg-primary text-white")}>
                  <LoadingGroup isLoading={isLoadingMembership || isLoadingUser} variant="spinner" className="w-4 h-4">
                    {owner.charAt(0).toUpperCase()}
                  </LoadingGroup>
                </AvatarFallback>
              </Avatar>
            </div>
          </TooltipTrigger>
          <TooltipContent>{!!owner && <>{owner}</>}</TooltipContent>
        </Tooltip>
      )}
    </>
  );
};
