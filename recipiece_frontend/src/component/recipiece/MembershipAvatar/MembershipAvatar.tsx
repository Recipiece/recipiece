import { DataTestId } from "@recipiece/constant";
import { Share2 } from "lucide-react";
import { FC, useMemo } from "react";
import { useGetSelfQuery, useGetUserKitchenMembershipQuery } from "../../../api";
import { cn } from "../../../util";
import { Avatar, AvatarFallback, Tooltip, TooltipContent, TooltipTrigger } from "../../shadcn";
import { LoadingGroup } from "../LoadingGroup";

export interface MembershipAvatarProps {
  readonly membershipId?: number | null;
  readonly size?: "small" | "medium" | "large";
  readonly entity?: { readonly user_id: number };
}

const SIZE_CLASSNAME_MAP = {
  small: "w-6 h-6 text-sm",
  medium: "w-8 h-8",
  large: "w-10 h-10 text-lg",
};

const ICON_SIZE_CLASSNAME_MAP = {
  small: "w-4 h-4",
  medium: "w-6 h-6",
  large: "w-8 h-8",
};

export const MembershipAvatar: FC<MembershipAvatarProps> = ({ entity, membershipId, size = "medium" }) => {
  const isValidMembershipId = !!membershipId && membershipId !== -1;
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

  const isOwnedByUser = entity && entity?.user_id === user?.id;

  return (
    <>
      {isValidMembershipId && (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={SIZE_CLASSNAME_MAP[size]} data-testid={DataTestId.MembershipAvatar.TOOLTIP_TRIGGER(membershipId)}>
              <Avatar className={SIZE_CLASSNAME_MAP[size]}>
                <AvatarFallback className={cn(SIZE_CLASSNAME_MAP[size], "cursor-pointer bg-primary text-white")}>
                  <LoadingGroup isLoading={isLoadingMembership || isLoadingUser} variant="spinner" className="w-4 h-4">
                    {!isOwnedByUser && <span data-testid={DataTestId.MembershipAvatar.DISPLAY_CONTENT(membershipId)}>{owner.charAt(0).toUpperCase()}</span>}
                    {isOwnedByUser && <Share2 data-testid={DataTestId.MembershipAvatar.DISPLAY_CONTENT(membershipId)} className={ICON_SIZE_CLASSNAME_MAP[size]} />}
                  </LoadingGroup>
                </AvatarFallback>
              </Avatar>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <>{!!owner && !isOwnedByUser && <span data-testid={DataTestId.MembershipAvatar.TOOLTIP_CONTENT(membershipId)}>{owner}</span>}</>
            <>{isOwnedByUser && <span data-testid={DataTestId.MembershipAvatar.TOOLTIP_CONTENT(membershipId)}>Shared with others</span>}</>
          </TooltipContent>
        </Tooltip>
      )}
    </>
  );
};
