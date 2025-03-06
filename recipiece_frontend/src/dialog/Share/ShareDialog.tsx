import { ListUserKitchenMembershipsQuerySchema, UserKitchenMembershipSchema } from "@recipiece/types";
import { FC, useCallback, useMemo, useState } from "react";
import { useListUserKitchenMembershipsQuery } from "../../api";
import { Avatar, AvatarFallback, Button, LoadingGroup, ScrollArea, ScrollBar } from "../../component";
import { useResponsiveDialogComponents } from "../../hooks";
import { BaseDialogProps } from "../BaseDialogProps";

export interface ShareDialogProps extends BaseDialogProps<UserKitchenMembershipSchema> {
  readonly displayName: string;
  readonly entity_id?: number;
  readonly entity_type?: ListUserKitchenMembershipsQuerySchema["entity_type"];
}

export const ShareDialog: FC<ShareDialogProps> = ({ displayName, entity_id, entity_type, onClose, onSubmit }) => {
  const { ResponsiveContent, ResponsiveHeader, ResponsiveDescription, ResponsiveTitle, ResponsiveFooter } =
    useResponsiveDialogComponents();
  const [isDisabled, setIsDisabled] = useState(false);

  const filters: ListUserKitchenMembershipsQuerySchema = useMemo(() => {
    let base: ListUserKitchenMembershipsQuerySchema = {
      from_self: true,
      page_number: 0,
      status: ["accepted"],
    };

    if (!!entity_id && !!entity_type) {
      base = {
        ...base,
        entity_id,
        entity_type,
        entity_filter: "exclude",
      };
    }

    return base;
  }, [entity_id, entity_type]);

  const { data: userKitchenMemberships, isLoading: isLoadingUserKitchenMemberships } =
    useListUserKitchenMembershipsQuery({ ...filters });

  const onSelectUser = useCallback(
    async (membership: UserKitchenMembershipSchema) => {
      setIsDisabled(true);
      onSubmit?.(membership)?.then?.(() => setIsDisabled(false));
    },
    [onSubmit]
  );

  return (
    <ResponsiveContent className="p-6">
      <ResponsiveHeader>
        <ResponsiveTitle>Share {displayName}</ResponsiveTitle>
        <ResponsiveDescription>Share your {displayName} with another user.</ResponsiveDescription>
      </ResponsiveHeader>
      <LoadingGroup isLoading={isLoadingUserKitchenMemberships} className="h-9 w-full">
        {userKitchenMemberships && (
          <ScrollArea className="w-full">
            {userKitchenMemberships!.data.length > 0 && (
              <div className="flex flex-row gap-2">
                {userKitchenMemberships!.data.map((membership) => {
                  return (
                    <Button
                      disabled={isDisabled}
                      onClick={() => onSelectUser(membership)}
                      key={membership.id}
                      variant="ghost"
                      className="h-fit w-fit"
                    >
                      <div className="flex flex-col items-center justify-center gap-1">
                        <Avatar>
                          <AvatarFallback className="bg-primary text-white">
                            {membership.destination_user.username.charAt(0).toUpperCase()}
                          </AvatarFallback>
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
        {userKitchenMemberships?.data.length === 0 && <>There&apos;s no one to share with!</>}
      </LoadingGroup>
      <ResponsiveFooter>
        <Button disabled={isDisabled} onClick={() => onClose?.()} variant="secondary">
          Cancel
        </Button>
      </ResponsiveFooter>
    </ResponsiveContent>
  );
};
