import { Ban, CheckCircle2 } from "lucide-react";
import { DateTime } from "luxon";
import { FC, useCallback, useState } from "react";
import { useListKitchenMembershipsQuery, useUpdateKitchenMembershipMutation } from "../../api";
import { Button, H3, LoadingGroup, Pager, StaticTable, StaticTableBody, StaticTableHeader, StaticTableRow, useToast } from "../../component";
import { UserKitchenMembership } from "../../data";

export const TargetingUserTable: FC = () => {
  const { toast } = useToast();
  const [kitchenMembershipsPage, setKitchenMembershipsPage] = useState(0);

  const { data: kitchenMembershipsTargetingUser, isLoading: isLoadingKitchenMembershipsTargetingUser } = useListKitchenMembershipsQuery({
    targeting_self: true,
    page_number: kitchenMembershipsPage,
    page_size: 10,
    status: ["pending"],
  });

  const { mutateAsync: updateKitchenMembership, isPending: isUpdatingKitchenMembership } = useUpdateKitchenMembershipMutation();

  const isLoadingTargetingUser = isLoadingKitchenMembershipsTargetingUser;
  const hasAnyTargetingRequests = !!kitchenMembershipsTargetingUser?.data?.length;

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
      <H3>Join a Brigade</H3>
      <p className="text-sm">Allow users to share their kitchen with you.</p>
      <LoadingGroup isLoading={isLoadingTargetingUser} className="w-10 h-10" variant="spinner">
        <StaticTable>
          <StaticTableHeader>
            <>From</>
            <>On</>
            <>Action</>
          </StaticTableHeader>
          {hasAnyTargetingRequests && (
            <StaticTableBody>
              {kitchenMembershipsTargetingUser.data.map((membership) => {
                return (
                  <StaticTableRow key={membership.id}>
                    <>{membership.source_user.username}</>
                    <>{DateTime.fromISO(membership.created_at).toLocaleString(DateTime.DATE_SHORT)}</>
                    <div className="flex flex-row gap-2">
                      <Button disabled={isUpdatingKitchenMembership} onClick={() => onAccept(membership)} className="grow">
                        <CheckCircle2 className="sm:mr-2" />
                        <p className="hidden sm:block">Accept</p>
                      </Button>

                      <Button disabled={isUpdatingKitchenMembership} variant="destructive" onClick={() => onDeny(membership)} className="grow">
                        <Ban className="sm:mr-2" />
                        <p className="hidden sm:block">Deny</p>
                      </Button>
                    </div>
                  </StaticTableRow>
                );
              })}
            </StaticTableBody>
          )}
        </StaticTable>
        {!hasAnyTargetingRequests && <p className="text-sm text-center">You have no pending requests.</p>}
        {hasAnyTargetingRequests && <Pager page={kitchenMembershipsPage} onPage={setKitchenMembershipsPage} hasNextPage={!!kitchenMembershipsTargetingUser?.has_next_page} />}
      </LoadingGroup>
    </div>
  );
};
