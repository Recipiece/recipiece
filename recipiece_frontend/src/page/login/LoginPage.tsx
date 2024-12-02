import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { FC, useCallback, useContext, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useLoginUserMutation } from "../../api";
import { Button, Form, FormCheckbox, FormInput, Stack, SubmitButton, useToast } from "../../component";
import { AuthContext } from "../../context";

const LoginFormSchema = z.object({
  username: z.string().email("Enter your email address."),
  password: z.string().min(1, "Enter your password."),
  remember: z.boolean().optional().default(false),
});

type LoginForm = z.infer<typeof LoginFormSchema>;

export const LoginPage: FC = () => {
  const { setAccessToken, setRefreshToken } = useContext(AuthContext);
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<LoginForm>({
    resolver: zodResolver(LoginFormSchema),
    defaultValues: {
      username: "",
      password: "",
      remember: false,
    },
  });

  useEffect(() => {
    queryClient.clear();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { mutateAsync: loginUser } = useLoginUserMutation();

  const onSubmit = useCallback(async (formData: LoginForm) => {
    try {
      const response = await loginUser({
        username: formData.username,
        password: formData.password,
      });
      setAccessToken(response.data.access_token);
      if (formData.remember) {
        setRefreshToken(response.data.refresh_token);
      }
      navigate("/dashboard");
    } catch (error) {
      if ((error as AxiosError)?.status === 404) {
        toast({
          description: "Incorrect username or password",
          variant: "destructive",
        });
      }
    }
  }, [setAccessToken, setRefreshToken, navigate, loginUser, toast]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Stack>
          <FormInput name="username" type="email" label="Username" />
          <FormInput name="password" type="password" label="Password" />
          <FormCheckbox className="mt-1 mb-1" name="remember" label="Remember Me" />
          <SubmitButton type="submit">Login</SubmitButton>
          <Button onClick={() => navigate("/create-account")} variant="link">
            Register Now
          </Button>
          <Button onClick={() => navigate("/forgot-password")} variant="link">
            Forgot Password?
          </Button>
        </Stack>
      </form>
    </Form>
  );
};
