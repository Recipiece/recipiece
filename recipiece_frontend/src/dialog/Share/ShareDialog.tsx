import { FC, useCallback, useMemo } from "react";
import { useListUserKitchenMembershipsQuery } from "../../api";
import { Avatar, AvatarFallback, Button, LoadingGroup, ScrollArea, ScrollBar } from "../../component";
import { ListUserKitchenMembershipFilters, UserKitchenMembership } from "../../data";
import { useResponsiveDialogComponents } from "../../hooks";
import { BaseDialogProps } from "../BaseDialogProps";

export interface ShareDialogProps extends BaseDialogProps<UserKitchenMembership> {
  readonly displayName: string;
  readonly entity_id?: number;
  readonly entity_type?: ListUserKitchenMembershipFilters["entity_type"];
}

export const ShareDialog: FC<ShareDialogProps> = ({ displayName, entity_id, entity_type, onClose, onSubmit }) => {
  const { ResponsiveContent, ResponsiveHeader, ResponsiveDescription, ResponsiveTitle, ResponsiveFooter } = useResponsiveDialogComponents();

  const filters: ListUserKitchenMembershipFilters = useMemo(() => {
    let base: ListUserKitchenMembershipFilters = {
      from_self: true,
      page_number: 0,
      status: ["accepted"],
    };

    if (!!entity_id && !!entity_type) {
      base = {
        ...base,
        entity_id,
        entity_type,
        entity: "exclude",
      };
    }

    return base;
  }, [entity_id, entity_type]);

  const { data: userKitchenMemberships, isLoading: isLoadingUserKitchenMemberships } = useListUserKitchenMembershipsQuery({ ...filters });

  const onSelectUser = useCallback(
    (membership: UserKitchenMembership) => {
      onSubmit?.(membership);
    },
    [onSubmit]
  );

  return (
    <ResponsiveContent className="p-6">
      <ResponsiveHeader>
        <ResponsiveTitle>Share {displayName}</ResponsiveTitle>
        <ResponsiveDescription>Share {displayName} to another user.</ResponsiveDescription>
      </ResponsiveHeader>
      <LoadingGroup isLoading={isLoadingUserKitchenMemberships} className="w-full h-9">
        {userKitchenMemberships && (
          <ScrollArea className="w-full">
            {userKitchenMemberships!.data.length > 0 && (
              <div className="flex flex-row gap-2">
                {userKitchenMemberships!.data.map((membership) => {
                  return (
                    <Button onClick={() => onSelectUser(membership)} key={membership.id} variant="ghost" className="w-fit h-fit">
                      <div className="flex flex-col gap-1 justify-center items-center">
                        <Avatar>
                          <AvatarFallback className="bg-primary text-white">{membership.destination_user.username.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <p className="text-sm">{membership.destination_user.username}</p>
                      </div>
                    </Button>
                  );
                })}
              </div>
            )}
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        )}
        {userKitchenMemberships?.data.length === 0 && <>There&apos;s no one in your kitchen!</>}
      </LoadingGroup>
      <ResponsiveFooter>
        <Button onClick={() => onClose?.()} variant="secondary">
          Cancel
        </Button>
      </ResponsiveFooter>
    </ResponsiveContent>
  );
};
