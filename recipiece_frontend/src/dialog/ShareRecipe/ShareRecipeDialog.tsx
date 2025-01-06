import { FC, useCallback } from "react";
import { BaseDialogProps } from "../BaseDialogProps";
import { useResponsiveDialogComponents } from "../../hooks";
import { useListUserKitchenMembershipsQuery } from "../../api";
import { Avatar, AvatarFallback, Button, LoadingGroup, ScrollArea, ScrollBar } from "../../component";
import { Recipe, UserKitchenMembership } from "../../data";

export interface ShareRecipeDialogProps extends BaseDialogProps<UserKitchenMembership> {
  readonly recipe: Recipe;
}

export const ShareRecipeDialog: FC<ShareRecipeDialogProps> = ({ recipe, onClose, onSubmit }) => {
  const { ResponsiveContent, ResponsiveHeader, ResponsiveDescription, ResponsiveTitle, ResponsiveFooter } = useResponsiveDialogComponents();
  const { data: userKitchenMemberships, isLoading: isLoadingUserKitchenMemberships } = useListUserKitchenMembershipsQuery({
    from_self: true,
    page_number: 0,
  });

  const onSelectUser = useCallback(
    (membership: UserKitchenMembership) => {
      onSubmit?.(membership);
    },
    [onSubmit]
  );

  return (
    <ResponsiveContent className="p-6">
      <ResponsiveHeader>
        <ResponsiveTitle>Share {recipe.name}</ResponsiveTitle>
        <ResponsiveDescription>Share {recipe.name} to another user.</ResponsiveDescription>
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
