import { zodResolver } from "@hookform/resolvers/zod";
import { DataTestId } from "@recipiece/constant";
import { FC, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { useResetPasswordMutation } from "../../api";
import { Button, Form, FormInput, Stack, SubmitButton, useToast } from "../../component";

const ResetPasswordFormSchema = z
  .object({
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .superRefine(({ password, confirmPassword }, ctx) => {
    if (password !== confirmPassword) {
      ctx.addIssue({
        code: "custom",
        message: "Passwords must match",
        path: ["confirmPassword"],
      });
    }
  });

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
          dataTestId: DataTestId.ResetPasswordPage.TOAST_SUCCESS,
        });
        navigate("/login");
      } catch {
        toast({
          title: "Error resetting password",
          description: "There was an error resetting your password. Please try again later.",
          variant: "destructive",
          dataTestId: DataTestId.ResetPasswordPage.TOAST_FAILURE,
        });
      }
    },
    [token, navigate, resetPassword, toast]
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Stack>
          <FormInput data-testid={DataTestId.ResetPasswordPage.INPUT_PASSWORD} type="password" name="password" label="Password" />
          <FormInput data-testid={DataTestId.ResetPasswordPage.INPUT_CONFIRM_PASSWORD} type="password" name="confirmPassword" label="Confirm Password" />
          <SubmitButton data-testid={DataTestId.ResetPasswordPage.BUTTON_RESET_PASSWORD}>Reset Password</SubmitButton>
          <Button
            data-testid={DataTestId.ResetPasswordPage.BUTTON_LOGIN}
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
