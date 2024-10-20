import { FC, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useLoginUserMutation } from "../../api";
import { Button, Checkbox, Form, FormControl, FormField, FormItem, FormLabel, FormMessage, Input, useToast } from "../../component";
import { UnauthenticatedLayout } from "../../component/recipiece";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { useQueryClient } from "@tanstack/react-query";

const LoginFormSchema = z.object({
  username: z.string().email("Enter an email address"),
  password: z.string(),
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
    <UnauthenticatedLayout>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => {
              return (
                <FormItem className="mb-4">
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => {
              return (
                <FormItem className="mb-4">
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <FormField
            control={form.control}
            name="rememberMe"
            render={() => {
              return (
                <FormItem className="mb-4">
                  <FormControl>
                    <Checkbox name="rememberMe" />
                  </FormControl>
                  <FormLabel className="inline mt-0 ml-4">Remember Me</FormLabel>
                </FormItem>
              );
            }}
          />
          <div className="w-full mb-4">
            <Button type="submit" className="w-full">
              Login
            </Button>
          </div>

          <div className="w-full">
            <Button type="button" variant="link" className="w-full">
              Register Now
            </Button>
          </div>
        </form>
      </Form>
    </UnauthenticatedLayout>
  );
};
