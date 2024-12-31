import { zodResolver } from "@hookform/resolvers/zod";
import { FC } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useCreateUserMutation } from "../../api";
import { Button, Form, FormInput, Stack, SubmitButton, useToast } from "../../component";

const CreateAccountFormSchema = z
  .object({
    email: z.string().email("Enter an email address"),
    username: z
      .string()
      .min(5, "Your username must be at least 5 characters")
      .max(40, "Your username must be less than 40 characters")
      .refine((val) => {
        return val.match(/[a-zA-Z_0-9-]+/);
      }, "Only letters, numbers, _, and - are allowed"),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((schema) => {
    return schema.confirmPassword === schema.password;
  }, "Passwords must match");

type CreateAccountForm = z.infer<typeof CreateAccountFormSchema>;

export const CreateAccountPage: FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { mutateAsync: createAccount } = useCreateUserMutation({
    onSuccess: () => {
      toast({
        title: "Account Created!",
        description: "You can now log into Recipiece with the email and password you provided",
      });
      navigate("/login");
    },
  });

  const form = useForm<CreateAccountForm>({
    resolver: zodResolver(CreateAccountFormSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (formData: CreateAccountForm) => {
    try {
      await createAccount({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });
    } catch {
      toast({
        title: "Unable to create account",
        description: "Recipiece couldn't create an account with the provided information. Please try again later.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Stack>
            <FormInput type="email" name="email" label="Email" />
            <FormInput type="text" name="username" label="Username" />
            <FormInput type="password" name="password" label="Password" />
            <FormInput type="password" name="confirmPassword" label="Confirm Password" />
            <SubmitButton>Create Account</SubmitButton>
            <Button
              variant="link"
              onClick={() => {
                navigate("/login");
              }}
            >
              I already have an account
            </Button>
          </Stack>
        </form>
      </Form>
    </>
  );
};
