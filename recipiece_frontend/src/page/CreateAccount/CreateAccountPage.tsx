import { zodResolver } from "@hookform/resolvers/zod";
import { DataTestId } from "@recipiece/constant";
import { FC, useContext } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useCreateUserMutation } from "../../api";
import { Button, Form, FormInput, Stack, SubmitButton, useToast } from "../../component";
import { TurnstileContext } from "../../context";

const CreateAccountFormSchema = z
  .object({
    email: z.string().email({ message: "Enter a valid email address" }),
    username: z
      .string()
      .min(5, "Your username must be at least 5 characters")
      .max(32, "Your username must be less than 32 characters")
      .refine((val) => {
        return val.match(/[a-zA-Z_0-9-]+/);
      }, "Only letters, numbers, _, and - are allowed"),
    password: z.string().min(8).max(128),
    confirmPassword: z.string().min(8).max(128),
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

type CreateAccountForm = z.infer<typeof CreateAccountFormSchema>;

export const CreateAccountPage: FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getTurnstileToken, isTurnstileEnabled } = useContext(TurnstileContext);

  const { mutateAsync: createAccount } = useCreateUserMutation();

  const form = useForm<CreateAccountForm>({
    resolver: zodResolver(CreateAccountFormSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (formData: CreateAccountForm) => {
    let turnstileToken: string | undefined;
    if (isTurnstileEnabled) {
      try {
        turnstileToken = await getTurnstileToken(3000);
      } catch {
        turnstileToken = undefined;
      }
    }

    try {
      await createAccount({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        turnstileToken: turnstileToken,
      });
      toast({
        title: "Account Created!",
        description: "You can now log into Recipiece with the email and password you provided",
        dataTestId: DataTestId.RegisterPage.TOAST_SUCCESS,
      });
      navigate("/login");
    } catch {
      toast({
        title: "Unable to create account",
        description: "Recipiece couldn't create an account with the provided information. Please try again later.",
        variant: "destructive",
        dataTestId: DataTestId.RegisterPage.TOAST_FAILURE,
      });
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Stack>
            <FormInput data-testid={DataTestId.RegisterPage.INPUT_EMAIL} type="text" name="email" label="Email" />
            <FormInput data-testid={DataTestId.RegisterPage.INPUT_USERNAME} type="text" name="username" label="Username" />
            <FormInput data-testid={DataTestId.RegisterPage.INPUT_PASSWORD} type="password" name="password" label="Password" />
            <FormInput data-testid={DataTestId.RegisterPage.INPUT_CONFIRM_PASSWORD} type="password" name="confirmPassword" label="Confirm Password" />
            <SubmitButton data-testid={DataTestId.RegisterPage.BUTTON_CREATE_ACCOUNT}>Create Account</SubmitButton>
            <Button
              data-testid={DataTestId.RegisterPage.BUTTON_LOGIN}
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
