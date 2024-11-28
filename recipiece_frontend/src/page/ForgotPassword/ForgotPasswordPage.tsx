import { zodResolver } from "@hookform/resolvers/zod";
import { FC, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Button, Form, FormInput, Stack, SubmitButton, useToast } from "../../component";
import { useRequestForgotPasswordMutation } from "../../api";

const ForgotPasswordFormSchema = z.object({
  username: z.string().email("Enter your email address."),
});

type ForgotPasswordForm = z.infer<typeof ForgotPasswordFormSchema>;

export const ForgotPasswordPage: FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [hasRequested, setHasRequested] = useState(false);
  const { mutateAsync: requestForgotPasswordToken } = useRequestForgotPasswordMutation({
    onSuccess: () => {
      setHasRequested(true);
    },
    onFailure: () => {
      toast({
        title: "Failed to request password reset token",
        variant: "destructive",
      });
    },
  });

  const form = useForm<ForgotPasswordForm>({
    resolver: zodResolver(ForgotPasswordFormSchema),
    defaultValues: {
      username: "",
    },
  });

  const onSubmit = async (formData: ForgotPasswordForm) => {
    try {
      await requestForgotPasswordToken({ ...formData });
    } catch {}
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Stack>
          <FormInput readOnly={hasRequested} type="email" name="username" label="Email Address" />
          {!hasRequested && <SubmitButton>Reset Password</SubmitButton>}
          {hasRequested && <p>If this email address is registered to an active account, a link was sent with instruction on how to reset your password.</p>}
          <Button type="button" variant="link" onClick={() => navigate("/login")}>
            Back to Login
          </Button>
        </Stack>
      </form>
    </Form>
  );
};
