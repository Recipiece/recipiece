import { UserSchema } from "@recipiece/types";
import { FC, useCallback } from "react";
import { useUpdateUserMutation } from "../../../api";
import {
  H3,
  Label,
  LoadingGroup,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  useToast,
} from "../../../component";

export interface PrivacySectionProps {
  readonly user?: UserSchema;
  readonly isLoading: boolean;
}

export const PrivacySection: FC<PrivacySectionProps> = ({ user, isLoading }) => {
  const { toast } = useToast();
  const accountVisibility = user?.preferences.account_visibility;

  const { mutateAsync: updateUser, isPending: isUpdatingUser } = useUpdateUserMutation();

  const onVisibilityChanged = useCallback(
    async (newVisibility: string) => {
      try {
        await updateUser({
          id: user!.id,
          preferences: {
            ...user!.preferences,
            account_visibility: newVisibility as UserSchema["preferences"]["account_visibility"],
          },
        });
        toast({
          title: "Account Visibility Updated",
        });
      } catch {
        toast({
          title: "Unable to Update Account Visibility",
          description: "There was an error updating your account visibility. Try again later.",
        });
      }
    },
    [toast, updateUser, user]
  );

  return (
    <>
      <H3>Privacy</H3>
      <div className="items-top flex flex-row">
        <div className="basis-9/12 sm:basis-1/2">
          <Label>Account Visibility</Label>
          <p className="text-xs">
            Control whether or not other users can invite you to their kitchen and share things with you. Existing
            shares and kitchen memberships will not be affected by this setting.
          </p>
        </div>
        <div className="ml-auto sm:ml-0">
          <LoadingGroup isLoading={isLoading}>
            <Select required disabled={isUpdatingUser} onValueChange={onVisibilityChanged} value={accountVisibility}>
              <SelectTrigger className="min-w-40">
                <SelectValue placeholder="Set Account Visibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="protected">Visible</SelectItem>
                <SelectItem value="private">Hidden</SelectItem>
              </SelectContent>
            </Select>
          </LoadingGroup>
        </div>
      </div>
    </>
  );
};
