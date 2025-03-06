import { FC } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button, Form, FormInput, Stack } from "../../component";

const VerifyAccountFormSchema = z.object({
  token: z.string().uuid("Invalid token"),
});

type VerifyAccountForm = z.infer<typeof VerifyAccountFormSchema>;

export const VerifyAccountPage: FC = () => {
  const form = useForm<VerifyAccountForm>({
    defaultValues: {
      token: "",
    },
  });

  const onSubmit = async (formData: VerifyAccountForm) => {};

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Stack>
          <FormInput
            name="token"
            type="text"
            label="Token"
            instructions="Enter the token that was sent to your email address"
          />
          <Button type="submit">Verify Account</Button>
        </Stack>
      </form>
    </Form>
  );
};
