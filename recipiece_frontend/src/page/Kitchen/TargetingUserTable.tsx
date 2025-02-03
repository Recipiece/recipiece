import { UserKitchenMembershipSchema } from "@recipiece/types";
import { Check, X } from "lucide-react";
import { DateTime } from "luxon";
import { FC, useCallback, useState } from "react";
import { useListUserKitchenMembershipsQuery, useUpdatePendingUserKitchenMembershipMutation } from "../../api";
import { Avatar, AvatarFallback, Button, H3, LoadingGroup, Pager, useToast } from "../../component";
import { PastTargetingMembershipsTable } from "./PastTargetingMembershipsTable";

export const TargetingUserTable: FC = () => {
  const { toast } = useToast();
  const [kitchenMembershipsPage, setKitchenMembershipsPage] = useState(0);

  const { data: kitchenMembershipsTargetingUser, isLoading: isLoadingKitchenMembershipsTargetingUser } = useListUserKitchenMembershipsQuery({
    targeting_self: true,
    page_number: kitchenMembershipsPage,
    page_size: 10,
    status: ["pending"],
  });

  const { mutateAsync: updateKitchenMembership, isPending: isUpdatingKitchenMembership } = useUpdatePendingUserKitchenMembershipMutation();

  const isLoadingTargetingUser = isLoadingKitchenMembershipsTargetingUser;
  const hasAnyTargetingRequests = !!kitchenMembershipsTargetingUser?.data?.length;

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
      <H3>Join a Brigade</H3>
      <p className="text-sm">Allow users to share their kitchen with you.</p>
      <LoadingGroup isLoading={isLoadingTargetingUser} className="h-10 w-10" variant="spinner">
        {hasAnyTargetingRequests && (
          <div className="mt-2 mb-2 flex flex-col gap-2">
            {kitchenMembershipsTargetingUser.data.map((membership) => {
              return (
                <div key={membership.id} className="flex flex-row items-center gap-2 border-b-[1px] border-b-primary pb-2">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary text-lg text-white">{membership.source_user.username.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span>{membership.source_user.username}</span>
                    <span className="text-xs">{DateTime.fromJSDate(membership.created_at).toLocal().toLocaleString(DateTime.DATE_SHORT)}</span>
                  </div>
                  <span className="ml-auto" />
                  <Button disabled={isUpdatingKitchenMembership} variant="ghost" onClick={() => onDeny(membership)}>
                    <X className="text-destructive" />
                  </Button>
                  <Button disabled={isUpdatingKitchenMembership} variant="ghost" onClick={() => onAccept(membership)}>
                    <Check className="text-primary" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
        {!hasAnyTargetingRequests && <p className="pt-4 pb-4 text-center text-sm">You have no pending requests.</p>}
        {hasAnyTargetingRequests && <Pager page={kitchenMembershipsPage} onPage={setKitchenMembershipsPage} hasNextPage={!!kitchenMembershipsTargetingUser?.has_next_page} />}
        <PastTargetingMembershipsTable />
      </LoadingGroup>
    </div>
  );
};
