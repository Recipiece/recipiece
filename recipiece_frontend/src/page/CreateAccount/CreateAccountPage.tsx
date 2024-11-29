import { zodResolver } from "@hookform/resolvers/zod";
import { FC } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useCreateUserMutation } from "../../api";
import { Button, Form, FormInput, Stack, SubmitButton, useToast } from "../../component";
import { Environment } from "../../util";

const CreateAccountFormSchema = z
  .object({
    username: z.string().email("Enter an email address"),
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
      {Environment.IS_CAST_IRON_SKILLET && (
        <Stack>
          <p>
            We&apos;re so glad you&apos;re interested in Recipiece! Currently, Recipiece is in its initial phase of release, and is not available to the public. If you are
            interested in early access, email <a href="mailto:support@recipiece.org">support@recipiece.org</a>. We&apos;d love to have you along for the ride!
          </p>
          <Button
            variant="link"
            onClick={() => {
              navigate("/login");
            }}
          >
            Back to Login
          </Button>
        </Stack>
      )}
      {!Environment.IS_CAST_IRON_SKILLET && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Stack>
              <FormInput type="email" name="username" label="Email" />
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
      )}
    </>
  );
};
