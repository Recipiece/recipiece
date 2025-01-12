import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { FC, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useGetSelfQuery, useRequestVerifyAccountMutation, useVerifyAccountMutation } from "../../../api";
import { Badge, Button, Form, FormInput, H3, LoadingGroup, Shelf, ShelfSpacer, Stack, useToast } from "../../../component";

const VerifyAccountFormSchema = z.object({
  token: z.string().uuid("Enter a valid token"),
});

type VerifyAccountForm = z.infer<typeof VerifyAccountFormSchema>;

export const VerifyAccountSection: FC = () => {
  const { toast } = useToast();

  const [hasRequestedToken, setHasRequestedToken] = useState(false);

  const { data: account, isLoading: isLoadingAccount } = useGetSelfQuery();
  const { mutateAsync: requestNewToken } = useRequestVerifyAccountMutation();
  const { mutateAsync: verifyAccount } = useVerifyAccountMutation();

  const form = useForm<VerifyAccountForm>({
    resolver: zodResolver(VerifyAccountFormSchema),
    defaultValues: {
      token: "",
    },
  });

  const onRequestVerificationToken = async () => {
    try {
      await requestNewToken();
      setHasRequestedToken(true);
      toast({
        description: `A verification token was sent to ${account?.email}.`,
      });
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
      toast({
        description: "Your account has been verified!",
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
      <H3>
        <div className="flex flex-row items-center gap-2">
          Account Status <Badge variant={account?.validated ? "default" : "secondary"}>{account?.validated ? "Verified" : "Not Verified"}</Badge>
        </div>
      </H3>
      {!account?.validated && (
        <Stack>
          <p className="text-sm">
            In order to keep using Recipiece, please verify your email address by entering the token that was emailed to {account?.email} in the field below. If you need another
            verification token, click the button below to request a new one.
          </p>
          <Shelf>
            <Button onClick={() => onRequestVerificationToken()} variant="secondary">
              Send verification token
            </Button>
            <ShelfSpacer />
          </Shelf>
          {hasRequestedToken && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <Stack>
                  <FormInput name="token" label="Email Verification Token" instructions={`Enter the token emailed to ${account?.email}`} />
                  <Button type="submit">Verify Account</Button>
                </Stack>
              </form>
            </Form>
          )}
        </Stack>
      )}
      {account?.validated && <p className="text-sm">Your account has been verified. You now have access to all the features of Recipiece.</p>}
    </LoadingGroup>
  );
};
