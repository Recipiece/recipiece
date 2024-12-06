import { FC, useCallback } from "react";
import { z } from "zod";
import { BaseDialogProps } from "../BaseDialogProps";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useResponsiveDialogComponents } from "../../hooks";
import { Button, Form, FormInput, SubmitButton, useToast } from "../../component";
import { lazyRequestNotificationsPermissions } from "../../util/permissions";

export interface CreateTimerDialogProps extends BaseDialogProps<CreateTimerForm> {}

const CreateTimerFormSchema = z.object({
  hours: z.coerce.number().max(23).min(0),
  minutes: z.coerce.number().max(59).min(0),
  seconds: z.coerce.number().max(59).min(0),
});

export type CreateTimerForm = z.infer<typeof CreateTimerFormSchema>;

export const CreateTimerDialog: FC<CreateTimerDialogProps> = ({ onClose, onSubmit }) => {
  const { ResponsiveContent, ResponsiveHeader, ResponsiveDescription, ResponsiveTitle, ResponsiveFooter } = useResponsiveDialogComponents();
  const { toast } = useToast();

  const form = useForm<CreateTimerForm>({
    resolver: zodResolver(CreateTimerFormSchema),
    defaultValues: {
      hours: 0,
      minutes: 0,
      seconds: 0,
    },
  });

  const { isSubmitting } = form.formState;

  const onCreateTimer = useCallback(
    async (formData: CreateTimerForm) => {
      if (onSubmit) {
        await onSubmit(formData);
      }
      try {
        const grantResult = await lazyRequestNotificationsPermissions();
        if (grantResult === "granted") {
          toast({
            title: "Notifications Allowed",
            description: "You have allowed Recipiece to send you notifications.",
          });
        } else if (grantResult === "denied") {
          toast({
            title: "Notifications Not Allowed",
            description:
              "Recipiece will not send you notifications. To use features like timers, you will need to grant Recipiece the permissions to send notifications. You can do this in your user profile.",
          });
        }
      } catch {}
    },
    [onSubmit, toast]
  );

  return (
    <ResponsiveContent className="p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onCreateTimer)}>
          <ResponsiveHeader className="mb-4">
            <ResponsiveTitle>Create Timer</ResponsiveTitle>
            <ResponsiveDescription>Create a new timer.</ResponsiveDescription>
          </ResponsiveHeader>

          <div className="flex flex-row gap-2">
            <FormInput name="hours" type="number" label="Hours" />
            <FormInput name="minutes" type="number" label="Minutes" />
            <FormInput name="seconds" type="number" label="Seconds" />
          </div>

          <ResponsiveFooter className="mt-4 flex-col-reverse">
            <Button disabled={isSubmitting} type="button" variant="outline" onClick={() => onClose?.()}>
              Cancel
            </Button>
            <SubmitButton>Create Timer</SubmitButton>
          </ResponsiveFooter>
        </form>
      </Form>
    </ResponsiveContent>
  );
};
