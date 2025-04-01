import { zodResolver } from "@hookform/resolvers/zod";
import { DataTestId } from "@recipiece/constant";
import { useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { FC, useCallback, useContext, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { TokenManager, useLoginUserMutation } from "../../api";
import { Button, Form, FormCheckbox, FormInput, SubmitButton, useToast } from "../../component";
import { TurnstileContext } from "../../context";

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
  const { getTurnstileToken, isTurnstileEnabled } = useContext(TurnstileContext);

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
      let turnstileToken: string | undefined;
      if (isTurnstileEnabled) {
        try {
          turnstileToken = await getTurnstileToken();
        } catch {
          turnstileToken = undefined;
        }
      }

      try {
        const response = await loginUser({
          username: formData.username,
          password: formData.password,
          turnstileToken: turnstileToken,
        });
        const tokenResolver = TokenManager.getInstance();
        tokenResolver.rememberUser = formData.remember;
        tokenResolver.accessToken = response.access_token;
        tokenResolver.refreshToken = response.refresh_token;
        navigate("/dashboard");
      } catch (error) {
        const status = (error as AxiosError)?.status;

        if (status === 403) {
          toast({
            description: "Incorrect username or password",
            variant: "destructive",
            dataTestId: DataTestId.LoginPage.TOAST_LOGIN_FAILED,
          });
        } else if (status !== 418) {
          toast({
            title: "Unable to Login",
            description: "Recipiece could not log you in. Please try again later.",
            variant: "destructive",
            dataTestId: DataTestId.LoginPage.TOAST_LOGIN_FAILED,
          });
        }
      }
    },
    [getTurnstileToken, isTurnstileEnabled, loginUser, navigate, toast]
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-2">
          <FormInput data-testid={DataTestId.LoginPage.INPUT_USERNAME} required autoCapitalize="none" name="username" type="text" label="Username or Email" />
          <FormInput data-testid={DataTestId.LoginPage.INPUT_PASSWORD} required name="password" type="password" label="Password" />
          <FormCheckbox data-testid={DataTestId.LoginPage.CHECKBOX_REMEMBER_ME} className="mb-2 mt-2" name="remember" label="Remember Me" />
          <SubmitButton data-testid={DataTestId.LoginPage.BUTTON_LOGIN} type="submit">
            Login
          </SubmitButton>
          <Button data-testid={DataTestId.LoginPage.BUTTON_REGISTER} onClick={() => navigate("/create-account")} variant="link">
            Register Now
          </Button>
          <Button data-testid={DataTestId.LoginPage.BUTTON_FORGOT_PASSWORD} onClick={() => navigate("/forgot-password")} variant="link">
            Forgot Password?
          </Button>
        </div>
      </form>
    </Form>
  );
};
