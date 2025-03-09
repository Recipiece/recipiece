import { zodResolver } from "@hookform/resolvers/zod";
import { UserKitchenMembershipSchema } from "@recipiece/types";
import { FC } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button, Form, FormSelect, SelectItem, SubmitButton } from "../../component";
import { useResponsiveDialogComponents } from "../../hooks";
import { BaseDialogProps } from "../BaseDialogProps";

export const EditMembershipFormSchema = z.object({
  grant_level: z.string(),
});

export type EditMembershipForm = z.infer<typeof EditMembershipFormSchema>;

export interface EditMembershipDialogProps extends BaseDialogProps<EditMembershipForm> {
  readonly userKitchenMembership: UserKitchenMembershipSchema;
}

export const EditMembershipDialog: FC<EditMembershipDialogProps> = ({ onClose, onSubmit, userKitchenMembership }) => {
  const { ResponsiveContent, ResponsiveHeader, ResponsiveDescription, ResponsiveFooter, ResponsiveTitle } =
    useResponsiveDialogComponents();

  const form = useForm<EditMembershipForm>({
    resolver: zodResolver(EditMembershipFormSchema),
    defaultValues: {
      grant_level: userKitchenMembership.grant_level,
    },
  });

  const onFormSubmitted = async (formData: EditMembershipForm) => {
    await onSubmit?.(formData);
  };

  return (
    <ResponsiveContent className="p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onFormSubmitted)}>
          <ResponsiveHeader>
            <ResponsiveTitle>Edit Sharing</ResponsiveTitle>
            <ResponsiveDescription>Change how this membership shares items to other users.</ResponsiveDescription>
          </ResponsiveHeader>

          <div className="mb-2 mt-2">
            <FormSelect name="grant_level" label="Access Level">
              <SelectItem value="SELECTIVE">Share Individual Items</SelectItem>
              <SelectItem value="ALL">Share Everything</SelectItem>
            </FormSelect>
          </div>

          <ResponsiveFooter className="flex-col-reverse">
            <Button variant="outline" disabled={form.formState.isSubmitting} onClick={() => onClose?.()}>
              Cancel
            </Button>
            <SubmitButton disabled={form.formState.isSubmitting}>Save</SubmitButton>
          </ResponsiveFooter>
        </form>
      </Form>
    </ResponsiveContent>
  );
};
