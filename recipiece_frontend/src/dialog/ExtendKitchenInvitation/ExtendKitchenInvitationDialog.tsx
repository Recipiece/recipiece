import { zodResolver } from "@hookform/resolvers/zod";
import { FC, useCallback } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useGetSelfQuery } from "../../api";
import { Button, Form, FormInput, SubmitButton } from "../../component";
import { useResponsiveDialogComponents } from "../../hooks";
import { BaseDialogProps } from "../BaseDialogProps";

export const ExtendKitchenInvitationFormSchema = z.object({
  username: z.string().min(5),
});

export type ExtendKitchenInvitationForm = z.infer<typeof ExtendKitchenInvitationFormSchema>;

export const ExtendKitchenInvitationDialog: FC<BaseDialogProps<ExtendKitchenInvitationForm>> = ({
  onClose,
  onSubmit,
}) => {
  const { data: user, isLoading: isLoadingUser } = useGetSelfQuery();
  const { ResponsiveContent, ResponsiveHeader, ResponsiveDescription, ResponsiveFooter, ResponsiveTitle } =
    useResponsiveDialogComponents();

  const form = useForm<ExtendKitchenInvitationForm>({
    resolver: zodResolver(ExtendKitchenInvitationFormSchema),
    defaultValues: {
      username: "",
    },
  });

  const onInviteUser = useCallback(
    async (formData: ExtendKitchenInvitationForm) => {
      if (formData.username === user!.username) {
        form.setError("username", {
          type: "custom",
          message: "You cannot invite yourself",
        });
      } else {
        onSubmit?.(formData);
      }
    },
    [form, onSubmit, user]
  );

  return (
    <ResponsiveContent className="p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onInviteUser)}>
          <ResponsiveHeader>
            <ResponsiveTitle>Invite a User</ResponsiveTitle>
            <ResponsiveDescription>
              Invite a user to your kitchen by entering their username below.
            </ResponsiveDescription>
          </ResponsiveHeader>

          <div className="mb-2">
            <FormInput autoComplete="off" name="username" label="Username" required />
          </div>

          <ResponsiveFooter className="flex-col-reverse">
            <Button
              variant="outline"
              disabled={form.formState.isSubmitting || isLoadingUser}
              onClick={() => onClose?.()}
            >
              Cancel
            </Button>
            <SubmitButton disabled={isLoadingUser}>Send Invitation</SubmitButton>
          </ResponsiveFooter>
        </form>
      </Form>
    </ResponsiveContent>
  );
};
