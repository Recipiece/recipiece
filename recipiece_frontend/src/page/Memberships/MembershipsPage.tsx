import { DataTestId } from "@recipiece/constant";
import { UserKitchenMembershipSchema } from "@recipiece/types";
import { Check, OctagonX } from "lucide-react";
import { DateTime } from "luxon";
import { FC, useCallback, useContext } from "react";
import { createPortal } from "react-dom";
import { useGetSelfQuery, useListUserKitchenMembershipsQuery, useUpdatePendingUserKitchenMembershipMutation } from "../../api";
import { Button, Divider, H2, H3, LoadingGroup, MembershipAvatar, RecipieceMenuBarContext, useToast } from "../../component";
import { useLayout } from "../../hooks";
import { MembershipsContextMenu } from "./MembershipsContextMenu";

export const MembershipsPage: FC = () => {
  const { toast } = useToast();
  const { mobileMenuPortalRef } = useContext(RecipieceMenuBarContext);
  const { isMobile } = useLayout();

  const { data: user, isLoading: isLoadingUser } = useGetSelfQuery();

  const { data: acceptedMemberships, isLoading: isLoadingAcceptedMemberships } = useListUserKitchenMembershipsQuery({
    from_self: true,
    targeting_self: true,
    status: ["accepted"],
    page_number: 0,
  });

  const { data: pendingMemberships, isLoading: isLoadingPendingMemberships } = useListUserKitchenMembershipsQuery({
    targeting_self: true,
    status: ["pending"],
    page_number: 0,
  });

  const { mutateAsync: updatePendingMembership, isPending: isUpdatingPendingMembership } = useUpdatePendingUserKitchenMembershipMutation();

  const onAcceptMembership = useCallback(
    async (membership: UserKitchenMembershipSchema) => {
      try {
        await updatePendingMembership({
          id: membership.id,
          status: "accepted",
        });
        toast({
          title: "Invite Accepted",
          description: `You have accepted an invite from ${membership.source_user.username}!`,
          dataTestId: DataTestId.MembershipsPage.TOAST_INVITE_ACCEPTED,
        });
      } catch {
        toast({
          title: "Unable to Accept Invite",
          description: `There was an error accepting the invite from ${membership.source_user.username}. Try again later`,
          dataTestId: DataTestId.MembershipsPage.TOAST_INVITE_ACCEPTED_FAILED,
        });
      }
    },
    [toast, updatePendingMembership]
  );

  const onDenyMembership = useCallback(
    async (membership: UserKitchenMembershipSchema) => {
      try {
        await updatePendingMembership({
          id: membership.id,
          status: "denied",
        });
        toast({
          title: "Invite Denied",
          description: `You have denied an invite from ${membership.source_user.username}!`,
          dataTestId: DataTestId.MembershipsPage.TOAST_INVITE_DENIED,
        });
      } catch {
        toast({
          title: "Unable to Deny Invite",
          description: `There was an error denying the invite from ${membership.source_user.username}. Try again later`,
          dataTestId: DataTestId.MembershipsPage.TOAST_INVITE_DENIED_FAILED,
        });
      }
    },
    [toast, updatePendingMembership]
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row gap-2">
        <H2 className="flex-grow">Kitchens</H2>
        {isMobile && mobileMenuPortalRef && mobileMenuPortalRef.current && createPortal(<MembershipsContextMenu />, mobileMenuPortalRef.current)}
        {!isMobile && <>{<MembershipsContextMenu />}</>}
      </div>
      <p className="text-sm">Manage yours and others&apos; kitchens</p>
      <LoadingGroup isLoading={isLoadingAcceptedMemberships || isLoadingPendingMemberships || isLoadingUser} variant="spinner" className="w-6 h-6">
        {!!pendingMemberships?.data?.length && <H3>Pending Invites</H3>}
        {(pendingMemberships?.data ?? []).map((membership) => {
          return (
            <div key={membership.id} className="flex flex-row gap-2">
              <div className="flex flex-col gap-2 mr-auto">
                <div className="flex flex-row gap-2" data-testid={DataTestId.MembershipsPage.PENDING_MEMBERSHIP_NAME(membership.id)}>
                  <MembershipAvatar membershipId={membership.id} size="small" />
                  {membership.source_user.id === user!.id ? membership.destination_user.username : membership.source_user.username}
                </div>
                <span data-testid={DataTestId.MembershipsPage.PENDING_MEMBERSHIP_SENT_AT(membership.id)} className="text-xs">
                  Sent on {DateTime.fromJSDate(membership.created_at, { zone: "UTC" }).toLocaleString(DateTime.DATE_MED)}
                </span>
              </div>
              <Button
                data-testid={DataTestId.MembershipsPage.BUTTON_ACCEPT_INVITE(membership.id)}
                disabled={isUpdatingPendingMembership}
                size="sm"
                onClick={() => onAcceptMembership(membership)}
              >
                <Check />
                <span className="hidden sm:block sm:ml-2">Accept</span>
              </Button>
              <Button
                data-testid={DataTestId.MembershipsPage.BUTTON_DENY_INVITE(membership.id)}
                disabled={isUpdatingPendingMembership}
                onClick={() => onDenyMembership(membership)}
                variant="destructive"
                size="sm"
              >
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
              <a data-testid={DataTestId.MembershipsPage.LINK_ACCEPTED_MEMBERSHIP(membership.id)} href={`/memberships/${membership.id}`} className="hover:underline">
                {membership.source_user.id === user!.id ? membership.destination_user.username : membership.source_user.username}
              </a>
            </div>
          );
        })}
      </LoadingGroup>
    </div>
  );
};
