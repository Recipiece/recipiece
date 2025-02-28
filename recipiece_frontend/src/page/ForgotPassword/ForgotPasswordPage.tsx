import { zodResolver } from "@hookform/resolvers/zod";
import { FC, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Button, Form, FormInput, Stack, SubmitButton, useToast } from "../../component";
import { useRequestForgotPasswordMutation } from "../../api";
import { DataTestId } from "@recipiece/constant";

const ForgotPasswordFormSchema = z.object({
  username_or_email: z.string().email("Enter your email address."),
});

type ForgotPasswordForm = z.infer<typeof ForgotPasswordFormSchema>;

export const ForgotPasswordPage: FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [hasRequested, setHasRequested] = useState(false);
  const { mutateAsync: requestForgotPasswordToken } = useRequestForgotPasswordMutation();

  const form = useForm<ForgotPasswordForm>({
    resolver: zodResolver(ForgotPasswordFormSchema),
    defaultValues: {
      username_or_email: "",
    },
  });

  const onSubmit = async (formData: ForgotPasswordForm) => {
    try {
      await requestForgotPasswordToken({ ...formData });
      setHasRequested(true);
    } catch {
      toast({
        title: "Failed to request password reset token",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Stack>
          <FormInput data-testid={DataTestId.ForgotPasswordPage.INPUT_EMAIL} readOnly={hasRequested} type="text" name="username_or_email" label="Email Address" />
          {!hasRequested && <SubmitButton data-testid={DataTestId.ForgotPasswordPage.BUTTON_FORGOT_PASSWORD}>Reset Password</SubmitButton>}
          {hasRequested && (
            <p data-testid={DataTestId.ForgotPasswordPage.PARAGRAPH_SENT}>
              If this email address is registered to an active account, a link was sent with instruction on how to reset your password.
            </p>
          )}
          <Button data-testid={DataTestId.ForgotPasswordPage.BUTTON_LOGIN} type="button" variant="link" onClick={() => navigate("/login")}>
            Back to Login
          </Button>
        </Stack>
      </form>
    </Form>
  );
};
