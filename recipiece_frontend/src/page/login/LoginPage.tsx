import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { FC, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useLoginUserMutation } from "../../api";
import { Button, Form, FormCheckbox, FormInput, Stack, SubmitButton, useToast } from "../../component";

const LoginFormSchema = z.object({
  username: z.string().email("Enter your email address."),
  password: z.string().min(1, "Enter your password."),
  rememberMe: z.boolean().optional().default(false),
});

type LoginForm = z.infer<typeof LoginFormSchema>;

export const LoginPage: FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    queryClient.clear();
  }, []);

  const onLoginSuccess = useCallback(() => {
    navigate("/dashboard");
  }, [navigate]);

  const { mutateAsync: loginUser } = useLoginUserMutation({
    onSuccess: onLoginSuccess,
  });

  const onSubmit = useCallback(async (formData: LoginForm) => {
    try {
      await loginUser({
        username: formData.username,
        password: formData.password,
      });
      navigate("/login");
    } catch (error) {
      if ((error as AxiosError)?.status === 404) {
        toast({
          description: "Incorrect username or password",
          variant: "destructive",
        });
      }
    }
  }, []);

  const form = useForm<LoginForm>({
    resolver: zodResolver(LoginFormSchema),
    defaultValues: {
      username: "",
      password: "",
      rememberMe: false,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Stack>
          <FormInput name="username" type="email" label="Username" />
          <FormInput name="password" type="password" label="Password" />
          <FormCheckbox name="rememberMe" label="Remember Me"/>
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
