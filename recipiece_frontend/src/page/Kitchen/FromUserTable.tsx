import { AxiosError } from "axios";
import { Handshake, SquareArrowOutUpRight, Trash } from "lucide-react";
import { DateTime } from "luxon";
import { FC, useCallback, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateKitchenMembershipMutation, useListUserKitchenMembershipsQuery } from "../../api";
import { Avatar, AvatarFallback, Button, H3, LoadingGroup, Pager, useToast } from "../../component";
import { DialogContext } from "../../context";
import { ExtendKitchenInvitationForm } from "../../dialog";
import { useDeleteUserKitchenMembershipDialog } from "./hook";

export const FromUserTable: FC = () => {
  const { pushDialog, popDialog } = useContext(DialogContext);
  const { toast } = useToast();
  const navigate = useNavigate();

  const [kitchenMembershipsPage, setKitchenMembershipsPage] = useState(0);

  const { data: kitchenMemberships, isLoading: isLoadingKitchenMemberships } = useListUserKitchenMembershipsQuery({
    from_self: true,
    page_number: kitchenMembershipsPage,
    page_size: 10,
  });
  const { mutateAsync: createKitchenMembership, isPending: isCreatingKitchenMembership } = useCreateKitchenMembershipMutation();
  const { deleteUserKitchenMembership, isDeletingUserKitchenMembership } = useDeleteUserKitchenMembershipDialog("source_user");

  const onExtendInvitation = useCallback(() => {
    pushDialog("extendKitchenInvitation", {
      onClose: () => popDialog("extendKitchenInvitation"),
      onSubmit: async (formData: ExtendKitchenInvitationForm) => {
        try {
          await createKitchenMembership({
            username: formData.username,
          });
          toast({
            title: "Invitation Sent",
          });
        } catch (err) {
          if ((err as AxiosError)?.status === 429) {
            toast({
              title: "Invitation Already Sent",
              description: "You have already sent an invitation to this user.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Failed to Send Invitation",
              description: "There was an error sending your invitation. Try again later.",
              variant: "destructive",
            });
          }
        } finally {
          popDialog("extendKitchenInvitation");
        }
      },
    });
  }, [createKitchenMembership, popDialog, pushDialog, toast]);

  const hasAnyRequests = !!kitchenMemberships?.data?.length;

  return (
    <div>
      <div className="mb-2 flex flex-row items-center">
        <H3>Invitations from You</H3>
        <Button variant="secondary" className="ml-auto" disabled={isCreatingKitchenMembership} onClick={onExtendInvitation}>
          <Handshake className="sm:mr-2" />
          <p className="hidden sm:block">Invite Users</p>
        </Button>
      </div>
      <p className="text-sm">Share your kitchen with other users.</p>
      <LoadingGroup isLoading={isLoadingKitchenMemberships} variant="spinner" className="h-10 w-10">
        {hasAnyRequests && (
          <div className="mb-2 mt-2 flex flex-col gap-2">
            {kitchenMemberships.data.map((membership) => {
              return (
                <div key={membership.id} className="flex flex-row items-center gap-2 border-b-[1px] border-b-primary pb-2">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary text-lg text-white">{membership.destination_user.username.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span>
                      {membership.destination_user.username} - {membership.status}
                    </span>
                    <span className="text-xs">{DateTime.fromJSDate(membership.created_at).toLocal().toLocaleString(DateTime.DATE_SHORT)}</span>
                  </div>
                  <span className="ml-auto" />
                  {membership.status === "accepted" && (
                    <Button variant="ghost" onClick={() => navigate(`/kitchen/${membership.id}`)} disabled={isDeletingUserKitchenMembership}>
                      <SquareArrowOutUpRight className="text-primary" />
                    </Button>
                  )}
                  {membership.status !== "accepted" && (
                    <Button variant="ghost" onClick={() => deleteUserKitchenMembership(membership)} disabled={isDeletingUserKitchenMembership}>
                      <Trash className="text-destructive" />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
        {!hasAnyRequests && <p className="text-center text-sm">You haven&apos;t invited anyone to your kitchen.</p>}
        {hasAnyRequests && <Pager page={kitchenMembershipsPage} onPage={setKitchenMembershipsPage} hasNextPage={!!kitchenMemberships?.has_next_page} />}
      </LoadingGroup>
    </div>
  );
};
