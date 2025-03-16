import { UserKitchenMembershipSchema } from "@recipiece/types";
import { Check, OctagonX } from "lucide-react";
import { DateTime } from "luxon";
import { FC, useCallback, useContext, useState } from "react";
import { createPortal } from "react-dom";
import { useListUserKitchenMembershipsQuery, useUpdatePendingUserKitchenMembershipMutation } from "../../api";
import {
  Button,
  Divider,
  H2,
  H3,
  LoadingGroup,
  MembershipAvatar,
  RecipieceMenuBarContext,
  useToast,
} from "../../component";
import { useLayout } from "../../hooks";
import { MembershipsContextMenu } from "./MembershipsContextMenu";

export const MembershipsPage: FC = () => {
  const { toast } = useToast();
  const { mobileMenuPortalRef } = useContext(RecipieceMenuBarContext);
  const { isMobile } = useLayout();

  const [acceptedPage, setAcceptedPage] = useState(0);
  const [pendingPage, setPendingPage] = useState(0);

  const { data: acceptedMemberships, isLoading: isLoadingAcceptedMemberships } = useListUserKitchenMembershipsQuery({
    from_self: true,
    targeting_self: true,
    status: ["accepted"],
    page_number: acceptedPage,
  });

  const { data: pendingMemberships, isLoading: isLoadingPendingMemberships } = useListUserKitchenMembershipsQuery({
    targeting_self: true,
    status: ["pending"],
    page_number: pendingPage,
  });

  const { mutateAsync: acceptPendingMembership, isPending: isAcceptingPendingMembership } =
    useUpdatePendingUserKitchenMembershipMutation();

  const onMembershipAccepted = useCallback(
    async (membership: UserKitchenMembershipSchema) => {
      try {
        await acceptPendingMembership({
          id: membership.id,
          status: "accepted",
        });
        toast({
          title: "Invite Accepted",
          description: `You have accepted an invite from ${membership.source_user.username}!`,
        });
      } catch {
        toast({
          title: "Unable to Accept Invite",
          description: `There was an error accepting the invite from ${membership.source_user.username}. Try again later`,
        });
      }
    },
    [toast, acceptPendingMembership]
  );

  const onDenyMembership = useCallback(async (membership: UserKitchenMembershipSchema) => {}, []);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row gap-2">
        <H2 className="flex-grow">Kitchens</H2>
        {isMobile &&
          mobileMenuPortalRef &&
          mobileMenuPortalRef.current &&
          createPortal(<MembershipsContextMenu />, mobileMenuPortalRef.current)}
        {!isMobile && <>{<MembershipsContextMenu />}</>}
      </div>
      <p className="text-sm">Manage yours and others&apos; kitchens</p>
      <LoadingGroup
        isLoading={isLoadingAcceptedMemberships || isLoadingPendingMemberships}
        variant="spinner"
        className="w-6 h-6"
      >
        {!!pendingMemberships?.data?.length && <H3>Pending Invites</H3>}
        {(pendingMemberships?.data ?? []).map((membership) => {
          return (
            <div key={membership.id} className="flex flex-row gap-2">
              <div className="flex flex-col gap-2 mr-auto">
                <div className="flex flex-row gap-2">
                  <MembershipAvatar membershipId={membership.id} size="small" />
                  {membership.source_user.username}
                </div>
                <span className="text-xs">
                  Sent on {DateTime.fromJSDate(membership.created_at).toLocaleString(DateTime.DATE_MED)}
                </span>
              </div>
              <Button
                disabled={isAcceptingPendingMembership}
                size="sm"
                onClick={() => onMembershipAccepted(membership)}
              >
                <Check />
                <span className="hidden sm:block sm:ml-2">Accept</span>
              </Button>
              <Button disabled={isAcceptingPendingMembership} variant="destructive" size="sm">
                <OctagonX />
                <span className="hidden sm:block sm:ml-2">Deny</span>
              </Button>
            </div>
          );
        })}
        {!!pendingMemberships?.data?.length && <Divider />}
        <H3>Accepted Invites</H3>
        {acceptedMemberships?.data?.length === 0 && <p>No one is in your kitchen.</p>}
        {(acceptedMemberships?.data ?? []).map((membership) => {
          return (
            <div key={membership.id} className="flex flex-row gap-2 items-center">
              <MembershipAvatar membershipId={membership.id} size="small" />
              <a href={`/memberships/${membership.id}`} className="hover:underline">
                {membership.source_user.username}
              </a>
            </div>
          );
        })}
      </LoadingGroup>
    </div>
  );
};
