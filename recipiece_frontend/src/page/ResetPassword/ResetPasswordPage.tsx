import { FC, useCallback, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useResetPasswordMutation } from "../../api";
import { z } from "zod";
import { Button, Form, FormInput, Stack, SubmitButton, useToast } from "../../component";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const ResetPasswordFormSchema = z
  .object({
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((schema) => {
    return schema.confirmPassword === schema.password;
  }, "Passwords must match");

type ResetPasswordForm = z.infer<typeof ResetPasswordFormSchema>;

export const ResetPasswordPage: FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const { toast } = useToast();

  const { mutateAsync: resetPassword } = useResetPasswordMutation();

  /**
   * Kick the user out if they don't have a token
   */
  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const form = useForm<ResetPasswordForm>({
    resolver: zodResolver(ResetPasswordFormSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = useCallback(
    async (formData: ResetPasswordForm) => {
      try {
        await resetPassword({
          token: token!,
          password: formData.password,
        });
        toast({
          title: "Password Reset",
          description: "You password was successfully reset. You may login with your new password.",
        });
        navigate("/login");
      } catch {
        toast({
          title: "Error resetting password",
          description: "There was an error resetting your password. Please try again later.",
          variant: "destructive",
        });
      }
    },
    [token, navigate, resetPassword, toast]
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Stack>
          <FormInput type="password" name="password" label="Password" />
          <FormInput type="password" name="confirmPassword" label="Confirm Password" />
          <SubmitButton>Reset Password</SubmitButton>
          <Button
            variant="link"
            onClick={() => {
              navigate("/login");
            }}
          >
            Back to Login
          </Button>
        </Stack>
      </form>
    </Form>
  );
};
