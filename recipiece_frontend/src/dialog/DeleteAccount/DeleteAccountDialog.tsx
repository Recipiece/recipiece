import { zodResolver } from "@hookform/resolvers/zod";
import { FC, useCallback } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useGetSelfQuery } from "../../api";
import { Button, Form, FormInput, SubmitButton } from "../../component";
import { useResponsiveDialogComponents } from "../../hooks";
import { BaseDialogProps } from "../BaseDialogProps";

const DeleteAccountFormSchema = z.object({
  username: z.string(),
  email: z.string().email(),
});

export type DeleteAccountForm = z.infer<typeof DeleteAccountFormSchema>;

export const DeleteAccountDialog: FC<BaseDialogProps<DeleteAccountForm>> = ({ onClose, onSubmit }) => {
  const { ResponsiveContent, ResponsiveHeader, ResponsiveDescription, ResponsiveTitle, ResponsiveFooter } = useResponsiveDialogComponents();
  const { data: user } = useGetSelfQuery();

  const form = useForm({
    resolver: zodResolver(DeleteAccountFormSchema),
    defaultValues: {
      username: "",
      email: "",
    },
  });

  const enteredUsername = form.watch("username");
  const enteredEmail = form.watch("email");
  const canSubmit = user?.email === enteredEmail && user?.username === enteredUsername;

  const onConfirmDelete = useCallback(
    (formData: DeleteAccountForm) => {
      onSubmit?.(formData);
    },
    [onSubmit]
  );

  return (
    <ResponsiveContent className="p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onConfirmDelete)}>
          <ResponsiveHeader className="mb-4">
            <ResponsiveTitle>Delete Account</ResponsiveTitle>
            <ResponsiveDescription>
              Enter your email and username below to confirm deletion of your account.
              <b className="text-destructive"> THIS ACTION IS PERMANENT AND CANNOT BE UNDONE!</b>
            </ResponsiveDescription>
          </ResponsiveHeader>

          <div className="flex flex-col gap-2">
            <FormInput name="email" type="email" label="Email" required />
            <FormInput name="username" required label="Username" />
          </div>

          <ResponsiveFooter className="mt-4 flex-col-reverse">
            <Button type="button" variant="outline" onClick={() => onClose?.()}>
              Cancel
            </Button>
            <SubmitButton disabled={!canSubmit} variant="destructive">
              Delete Account
            </SubmitButton>
          </ResponsiveFooter>
        </form>
      </Form>
    </ResponsiveContent>
  );
};
