import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { FC } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useGetSelfQuery, useRequestVerifyAccountMutation, useVerifyAccountMutation } from "../../api";
import { Badge, Button, Form, FormInput, LoadingGroup, Shelf, ShelfSpacer, Stack, useToast } from "../../component";

const VerifyAccountFormSchema = z.object({
  token: z.string().uuid("Enter a valid token"),
});

type VerifyAccountForm = z.infer<typeof VerifyAccountFormSchema>;

export const VerifyAccountSection: FC = () => {
  const { toast } = useToast();

  const { data: account, isLoading: isLoadingAccount } = useGetSelfQuery();
  const { mutateAsync: requestNewToken } = useRequestVerifyAccountMutation({
    onSuccess: () => {
      toast({
        description: `A verification token was sent to ${account?.email}.`,
      });
    },
  });
  const { mutateAsync: verifyAccount } = useVerifyAccountMutation({
    onSuccess: () => {
      toast({
        description: "Your account has been verified!",
      });
    },
  });

  const form = useForm<VerifyAccountForm>({
    resolver: zodResolver(VerifyAccountFormSchema),
    defaultValues: {
      token: "",
    },
  });

  const onRequestVerificationToken = async () => {
    try {
      await requestNewToken();
    } catch (error) {
      if ((error as AxiosError)?.status === 429) {
        toast({
          description: "You recently request a verification token. Please try again later.",
          variant: "destructive",
        });
      } else {
        toast({
          description: "We were unable to send a verification token. Please try again later.",
          variant: "destructive",
        });
      }
    }
  };

  const onSubmit = async (formData: VerifyAccountForm) => {
    try {
      await verifyAccount({
        token: formData.token,
      });
    } catch {
      toast({
        description: "We were unable to verify your account. Please try again later.",
        variant: "destructive",
      });
    }
  };

  return (
    <LoadingGroup isLoading={isLoadingAccount} variant="spinner" className="w-8 h-8">
      <h1 className="text-lg">
        Account Status: <Badge variant={account?.validated ? "default" : "secondary"}>{account?.validated ? "Verified" : "Not Verified"}</Badge>
      </h1>
      {!account?.validated && (
        <Stack>
          <p className="text-sm">
            In order to keep using Recipiece, please verify your email address by entering the token that was emailed to {account?.email} in the field below. If you need another
            verification token, click the link below to request a new one.
          </p>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <Stack>
                <FormInput name="token" label="Email Verification Token" instructions={`Enter the token emailed to ${account?.email}`} />
                <Button type="submit">Verify Account</Button>
                <Shelf>
                  <Button onClick={() => onRequestVerificationToken()} className="px-0 py-0" variant="link">
                    Send another verification token
                  </Button>
                  <ShelfSpacer />
                </Shelf>
              </Stack>
            </form>
          </Form>
        </Stack>
      )}
    </LoadingGroup>
  );
};
