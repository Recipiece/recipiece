import { zodResolver } from "@hookform/resolvers/zod";
import { DataTestId } from "@recipiece/constant";
import { useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { FC, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { TokenManager, useLoginUserMutation } from "../../api";
import { Button, Form, FormCheckbox, FormInput, Stack, SubmitButton, useToast } from "../../component";

const LoginFormSchema = z.object({
  username: z.string(),
  password: z.string().min(1, "Enter your password."),
  remember: z.boolean().optional().default(false),
});

type LoginForm = z.infer<typeof LoginFormSchema>;

export const LoginPage: FC = () => {
  const navigate = useNavigate();
  const { toast, dismiss: dismissToast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<LoginForm>({
    resolver: zodResolver(LoginFormSchema),
    defaultValues: {
      username: "",
      password: "",
      remember: false,
    },
  });

  /**
   * Clear all data from the query client
   * Clear any toasts that exist
   */
  useEffect(() => {
    queryClient.clear();
    dismissToast();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { mutateAsync: loginUser } = useLoginUserMutation();

  const onSubmit = useCallback(
    async (formData: LoginForm) => {
      try {
        const response = await loginUser({
          username: formData.username,
          password: formData.password,
        });
        const tokenResolver = TokenManager.getInstance();
        tokenResolver.rememberUser = formData.remember;
        tokenResolver.accessToken = response.access_token;
        tokenResolver.refreshToken = response.refresh_token;
        navigate("/dashboard");
      } catch (error) {
        if ((error as AxiosError)?.status === 403) {
          toast({
            description: "Incorrect username or password",
            variant: "destructive",
            dataTestId: DataTestId.LoginPage.TOAST_LOGIN_FAILED,
          });
        }
      }
    },
    [navigate, loginUser, toast]
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Stack>
          <FormInput
            data-testid={DataTestId.LoginPage.INPUT_USERNAME}
            required
            autoCapitalize="none"
            name="username"
            type="text"
            label="Username or Email"
          />
          <FormInput
            data-testid={DataTestId.LoginPage.INPUT_PASSWORD}
            required
            name="password"
            type="password"
            label="Password"
          />
          <FormCheckbox
            data-testid={DataTestId.LoginPage.CHECKBOX_REMEMBER_ME}
            className="mb-1 mt-1"
            name="remember"
            label="Remember Me"
          />
          <SubmitButton data-testid={DataTestId.LoginPage.BUTTON_LOGIN} type="submit">
            Login
          </SubmitButton>
          <Button
            data-testid={DataTestId.LoginPage.BUTTON_REGISTER}
            onClick={() => navigate("/create-account")}
            variant="link"
          >
            Register Now
          </Button>
          <Button
            data-testid={DataTestId.LoginPage.BUTTON_FORGOT_PASSWORD}
            onClick={() => navigate("/forgot-password")}
            variant="link"
          >
            Forgot Password?
          </Button>
        </Stack>
      </form>
    </Form>
  );
};
