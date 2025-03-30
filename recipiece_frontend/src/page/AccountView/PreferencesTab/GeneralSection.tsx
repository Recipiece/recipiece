import { UserSchema } from "@recipiece/types";
import { FC } from "react";
import { useUpdateUserMutation } from "../../../api";
import { H3, Label, LoadingGroup, Switch, useToast } from "../../../component";

export const GeneralSection: FC<{ readonly user?: UserSchema; readonly isLoading: boolean }> = ({ user, isLoading }) => {
  const { toast } = useToast();
  const parsingMode = user?.preferences.recipe_import_mode;

  const { mutateAsync: updateUser, isPending: isUpdatingUser } = useUpdateUserMutation();

  const onChangeParsingMode = async (checked: boolean) => {
    const newParsingMode = checked ? "wild" : "strict";
    try {
      await updateUser({
        id: user!.id,
        preferences: {
          ...user!.preferences,
          recipe_import_mode: newParsingMode,
        },
      });
      toast({
        title: "Parsing Mode Changed",
      });
    } catch {
      toast({
        title: "Unable to Change Parsing Mode",
        description: "There was an error updating your parsing mode. Try again later.",
      });
    }
  };

  return (
    <>
      <H3>General</H3>
      <div className="items-top flex flex-row">
        <div className="basis-9/12 sm:basis-1/2">
          <Label>&quot;Wild&quot; Parsing</Label>
          <p className="text-xs">
            Not all sites are officially supported, but if this option is checked, Recipiece can attempt to import the recipe anyways. You should double check imported recipes when
            this is checked.
          </p>
        </div>
        <div className="ml-auto sm:ml-0 pl-2">
          <LoadingGroup isLoading={isLoading}>
            <Switch checked={parsingMode === "wild"} onCheckedChange={onChangeParsingMode} disabled={isLoading || isUpdatingUser} />
          </LoadingGroup>
        </div>
      </div>
    </>
  );
};
