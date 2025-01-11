import { Ban, CheckCircle2, ChevronDown, ChevronUp, Trash } from "lucide-react";
import { DateTime } from "luxon";
import { FC, useCallback, useState } from "react";
import { useListUserKitchenMembershipsQuery, useUpdatedNonPendingUserKitchenMembershipMutation } from "../../api";
import {
  Button,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  H3,
  LoadingGroup,
  Pager,
  StaticTable,
  StaticTableBody,
  StaticTableHeader,
  StaticTableRow,
  useToast,
} from "../../component";
import { UserKitchenMembership } from "../../data";
import { KitchenMembershipStatusMap } from "../../util";
import { useDeleteUserKitchenMembershipDialog } from "./hook";

export const PastTargetingMembershipsTable: FC = () => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [kitchenMembershipsPage, setKitchenMembershipsPage] = useState(0);

  const { mutateAsync: updateKitchenMembership, isPending: isUpdatingKitchenMembership } = useUpdatedNonPendingUserKitchenMembershipMutation();
  const { data: kitchenMemberships, isLoading: isLoadingKitchenMemberships } = useListUserKitchenMembershipsQuery({
    targeting_self: true,
    page_number: kitchenMembershipsPage,
    page_size: 10,
    status: ["accepted", "denied"],
  });

  const { deleteUserKitchenMembership, isDeletingUserKitchenMembership } = useDeleteUserKitchenMembershipDialog("destination_user");

  const hasAnyRequests = !!kitchenMemberships?.data?.length;

  const onAccept = useCallback(
    async (membership: UserKitchenMembership) => {
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
    async (membership: UserKitchenMembership) => {
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
            <div className="flex flex-row items-center cursor-pointer">
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
          <LoadingGroup isLoading={isLoadingKitchenMemberships} className="w-10 h-10" variant="spinner">
            <StaticTable>
              <StaticTableHeader>
                <>From</>
                <>On</>
                <>Status</>
                <>Action</>
              </StaticTableHeader>
              {hasAnyRequests && (
                <StaticTableBody>
                  {kitchenMemberships.data.map((membership) => {
                    return (
                      <StaticTableRow key={membership.id}>
                        <>{membership.source_user.username}</>
                        <>{DateTime.fromISO(membership.created_at).toLocaleString(DateTime.DATE_SHORT)}</>
                        <>{KitchenMembershipStatusMap[membership.status]}</>
                        <div className="flex flex-row gap-2">
                          {membership.status !== "accepted" && (
                            <Button disabled={isUpdatingKitchenMembership} onClick={() => onAccept(membership)}>
                              <CheckCircle2 className="sm:mr-2" />
                              <p className="hidden sm:block">Accept</p>
                            </Button>
                          )}
                          {membership.status !== "denied" && (
                            <Button disabled={isUpdatingKitchenMembership} variant="secondary" onClick={() => onDeny(membership)}>
                              <Ban className="sm:mr-2" />
                              <p className="hidden sm:block">Deny</p>
                            </Button>
                          )}
                          <Button
                            variant="destructive"
                            disabled={isDeletingUserKitchenMembership || isUpdatingKitchenMembership}
                            onClick={() => deleteUserKitchenMembership(membership)}
                          >
                            <Trash className="sm:mr-2" /> <p className="hidden sm:block">Delete</p>
                          </Button>
                        </div>
                      </StaticTableRow>
                    );
                  })}
                </StaticTableBody>
              )}
            </StaticTable>
            {!hasAnyRequests && <p className="text-sm text-center">You have no past requests.</p>}
            {hasAnyRequests && <Pager page={kitchenMembershipsPage} onPage={setKitchenMembershipsPage} hasNextPage={!!kitchenMemberships?.has_next_page} />}
          </LoadingGroup>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
