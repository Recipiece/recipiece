import { FC, useCallback, useContext, useState } from "react";
import { Button, H3, LoadingGroup, Pager, StaticTable, StaticTableBody, StaticTableHeader, StaticTableRow, useToast } from "../../component";
import { Ban, Handshake, SquareArrowOutUpRight } from "lucide-react";
import { useCreateKitchenMembershipMutation, useListKitchenMembershipsQuery } from "../../api";
import { DateTime } from "luxon";
import { DialogContext } from "../../context";
import { ExtendKitchenInvitationForm } from "../../dialog";
import { AxiosError } from "axios";
import { KitchenMembershipStatusMap } from "../../util";
import { useNavigate } from "react-router-dom";

export const FromUserTable: FC = () => {
  const { pushDialog, popDialog } = useContext(DialogContext);
  const { toast } = useToast();
  const navigate = useNavigate();

  const [kitchenMembershipsPage, setKitchenMembershipsPage] = useState(0);

  const { data: kitchenMemberships, isLoading: isLoadingKitchenMemberships } = useListKitchenMembershipsQuery({
    from_self: true,
    page_number: kitchenMembershipsPage,
    page_size: 10,
  });

  const { mutateAsync: createKitchenMembership, isPending: isCreatingKitchenMembership } = useCreateKitchenMembershipMutation();

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
        } catch(err) {
          if((err as AxiosError)?.status === 429) {
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
      <div className="flex flex-row mb-2 items-center">
        <H3>Invitations from You</H3>
        <Button variant="secondary" className="ml-auto" disabled={isCreatingKitchenMembership} onClick={onExtendInvitation}>
          <Handshake className="sm:mr-2" />
          <p className="hidden sm:block">Extend an Invitation</p>
        </Button>
      </div>
      <p className="text-sm">Share your kitchen with other users.</p>
      <LoadingGroup isLoading={isLoadingKitchenMemberships} variant="spinner" className="w-10 h-10">
        <StaticTable>
          <StaticTableHeader>
            <>To</>
            <>On</>
            <>Status</>
            <>Action</>
          </StaticTableHeader>
          {hasAnyRequests && (
            <StaticTableBody>
              {kitchenMemberships.data.map((membership) => {
                return (
                  <StaticTableRow key={membership.id}>
                    <>{membership.destination_user.username}</>
                    <>{DateTime.fromISO(membership.created_at).toLocaleString(DateTime.DATE_SHORT)}</>
                    <>{KitchenMembershipStatusMap[membership.status]}</>
                    <div className="flex flex-row gap-2">
                      {membership.status === "accepted" && (
                        <Button variant="secondary" className="grow" onClick={() => navigate(`/kitchen/${membership.id}`)}>
                          <SquareArrowOutUpRight className="mr-2" /> Manage
                        </Button>
                      )}
                      {membership.status === "accepted" && (
                        <Button className="grow" variant="destructive">
                          <Ban className="mr-2" /> Delete
                        </Button>
                      )}
                    </div>
                  </StaticTableRow>
                );
              })}
            </StaticTableBody>
          )}
        </StaticTable>
        {!hasAnyRequests && <p className="text-sm text-center">There are no requests.</p>}
        {hasAnyRequests && <Pager page={kitchenMembershipsPage} onPage={setKitchenMembershipsPage} hasNextPage={!!kitchenMemberships?.has_next_page} />}
      </LoadingGroup>
    </div>
  );
};
