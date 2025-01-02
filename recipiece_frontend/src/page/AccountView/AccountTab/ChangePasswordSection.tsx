import { zodResolver } from "@hookform/resolvers/zod";
import { FC, useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useChangePasswordMutation, useGetSelfQuery } from "../../../api";
import { Button, Card, Form, FormInput, H3, Stack, SubmitButton, useToast } from "../../../component";

const ChangePasswordFormSchema = z
  .object({
    currentPassword: z.string(),
    newPassword: z.string().min(8),
    confirmNewPassword: z.string().min(8),
  })
  .refine((schema) => {
    return schema.confirmNewPassword === schema.newPassword;
  }, "Passwords must match");

type ChangePasswordForm = z.infer<typeof ChangePasswordFormSchema>;

export const ChangePasswordSection: FC = () => {
  const [isEditing, setIsEditing] = useState(false);

  const { toast } = useToast();
  const navigate = useNavigate();

  const { mutateAsync: changePassword } = useChangePasswordMutation();
  const { data: user } = useGetSelfQuery();

  const form = useForm<ChangePasswordForm>({
    resolver: zodResolver(ChangePasswordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const onSubmit = useCallback(
    async (formData: ChangePasswordForm) => {
      try {
        await changePassword({
          username: user!.username,
          password: formData.currentPassword,
          new_password: formData.newPassword,
        });
        toast({
          title: "Password Changed",
          description: "Your password was changed. For security, you have been logged out of all sessions.",
        });
        navigate("/login");
      } catch {
        toast({
          title: "Unable to Change Password",
          description: "Your password could not be changed. Try again later",
          variant: "destructive",
        });
      }
    },
    [changePassword, navigate, toast, user]
  );

  const onCancel = useCallback(() => {
    setIsEditing(false);
    form.reset({
      newPassword: "",
      currentPassword: "",
      confirmNewPassword: "",
    })
  }, [form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-2">
          <H3>Password</H3>
          <p className="text-sm">
            You can change your password by clicking the button below. If you change your password, you will be logged out immediately from all devices and will need to login again
            with your new password.
          </p>
          {isEditing && (
            <>
              <FormInput name="currentPassword" type="password" label="Current Password" className="sm:pr-[50%]" />
              <FormInput name="newPassword" label="New Password" type="password" className="sm:pr-[50%]" />
              <FormInput name="confirmNewPassword" label="Confirm New Password" type="password" className="sm:pr-[50%]" />
            </>
          )}
          
            <div className="flex flex-row gap-2">
            {!isEditing && (
              <Button onClick={() => setIsEditing(true)} className="ml-auto">Change Password</Button>
            )}
            {isEditing && (
              <Button onClick={onCancel} variant="secondary" className="ml-auto">
                Cancel
              </Button>
            )}
            {isEditing && (
              <SubmitButton>
                Change Password
              </SubmitButton>
            )}
            </div>
          
        </div>
      </form>
    </Form>
  );
};
