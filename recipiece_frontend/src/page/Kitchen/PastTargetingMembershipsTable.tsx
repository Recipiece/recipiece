import { UserKitchenMembershipSchema } from "@recipiece/types";
import { Ban, CheckCircle2, ChevronDown, ChevronUp, Trash } from "lucide-react";
import { DateTime } from "luxon";
import { FC, useCallback, useState } from "react";
import { useListUserKitchenMembershipsQuery, useUpdatedNonPendingUserKitchenMembershipMutation } from "../../api";
import {
  Avatar,
  AvatarFallback,
  Button,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  H3,
  LoadingGroup,
  Pager,
  useToast,
} from "../../component";
import { useDeleteUserKitchenMembershipDialog } from "./hook";

export const PastTargetingMembershipsTable: FC = () => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [kitchenMembershipsPage, setKitchenMembershipsPage] = useState(0);

  const { mutateAsync: updateKitchenMembership, isPending: isUpdatingKitchenMembership } =
    useUpdatedNonPendingUserKitchenMembershipMutation();
  const { data: kitchenMemberships, isLoading: isLoadingKitchenMemberships } = useListUserKitchenMembershipsQuery({
    targeting_self: true,
    page_number: kitchenMembershipsPage,
    page_size: 10,
    status: ["accepted", "denied"],
  });

  const { deleteUserKitchenMembership, isDeletingUserKitchenMembership } =
    useDeleteUserKitchenMembershipDialog("destination_user");

  const hasAnyRequests = !!kitchenMemberships?.data?.length;

  const onAccept = useCallback(
    async (membership: UserKitchenMembershipSchema) => {
      try {
        await updateKitchenMembership({
          id: membership.id,
          status: "accepted",
        });
        toast({
          title: "Invitation Accepted",
          description: `You've accepted an invitation from ${membership.source_user.username}. They will now be able to share with you.`,
        });
      } catch {
        toast({
          title: "Could Not Accept Invitation",
          description: "There was an error accepting the invitation. Try again later.",
          variant: "destructive",
        });
      }
    },
    [toast, updateKitchenMembership]
  );

  const onDeny = useCallback(
    async (membership: UserKitchenMembershipSchema) => {
      try {
        await updateKitchenMembership({
          id: membership.id,
          status: "denied",
        });
        toast({
          title: "Invitation Denied",
          description: `You've denied an invitation from ${membership.source_user.username}.`,
        });
      } catch {
        toast({
          title: "Could Not Deny Invitation",
          description: "There was an error denying the invitation. Try again later.",
          variant: "destructive",
        });
      }
    },
    [toast, updateKitchenMembership]
  );

  return (
    <div>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <div>
            <div className="flex cursor-pointer flex-row items-center">
              <H3>Past Requests</H3>
              <Button className="ml-auto" variant="ghost">
                {!isOpen && <ChevronUp />}
                {isOpen && <ChevronDown />}
              </Button>
            </div>
            <p className="text-sm">Manage invitations you have previously accepted/denied.</p>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <LoadingGroup isLoading={isLoadingKitchenMemberships} className="h-10 w-10" variant="spinner">
            {hasAnyRequests && (
              <div className="mb-2 mt-2 flex flex-col gap-2">
                {kitchenMemberships.data.map((membership) => {
                  return (
                    <div
                      key={membership.id}
                      className="flex flex-row items-center gap-2 border-b-[1px] border-b-primary pb-2"
                    >
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary text-lg text-white">
                          {membership.source_user.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span>{membership.source_user.username}</span>
                        <span className="text-xs">
                          {DateTime.fromJSDate(membership.created_at).toLocal().toLocaleString(DateTime.DATE_SHORT)}
                        </span>
                      </div>
                      <span className="ml-auto" />
                      {membership.status !== "accepted" && (
                        <Button
                          variant="ghost"
                          disabled={isUpdatingKitchenMembership}
                          onClick={() => onAccept(membership)}
                        >
                          <CheckCircle2 className="text-primary" />
                        </Button>
                      )}
                      {membership.status !== "denied" && (
                        <Button
                          disabled={isUpdatingKitchenMembership}
                          variant="ghost"
                          onClick={() => onDeny(membership)}
                        >
                          <Ban />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        disabled={isDeletingUserKitchenMembership || isUpdatingKitchenMembership}
                        onClick={() => deleteUserKitchenMembership(membership)}
                      >
                        <Trash className="text-destructive" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
            {!hasAnyRequests && <p className="pb-4 pt-4 text-center text-sm">You have no past requests.</p>}
            {hasAnyRequests && (
              <Pager
                page={kitchenMembershipsPage}
                onPage={setKitchenMembershipsPage}
                hasNextPage={!!kitchenMemberships?.has_next_page}
              />
            )}
          </LoadingGroup>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
