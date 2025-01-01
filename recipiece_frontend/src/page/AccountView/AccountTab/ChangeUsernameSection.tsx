import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useGetSelfQuery, useUpdateUserMutation } from "../../../api";
import { Button, Form, FormInput, Stack, SubmitButton, useToast } from "../../../component";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const ChangeUsernameFormSchema = z.object({
  username: z.string(),
  email: z.string().email(),
});

type ChangeUsernameForm = z.infer<typeof ChangeUsernameFormSchema>;

export const ChangeUsernameSection: FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  const { data: user } = useGetSelfQuery();
  const { mutateAsync: updateUser } = useUpdateUserMutation();

  const defaultValues = useMemo(() => {
    if (user) {
      return {
        username: user.username,
        email: user.email,
      };
    } else {
      return {
        username: "",
        email: "",
      };
    }
  }, [user]);

  const form = useForm<ChangeUsernameForm>({
    defaultValues: defaultValues,
    resolver: zodResolver(ChangeUsernameFormSchema),
  });

  useEffect(() => {
    form.reset({ ...defaultValues });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValues]);

  const onCancel = useCallback(() => {
    setIsEditing(false);
    form.reset({ ...defaultValues });
  }, [defaultValues, form]);

  const onSubmit = useCallback(
    async (formData: ChangeUsernameForm) => {
      try {
        await updateUser({
          id: user!.id,
          ...formData,
        });
        toast({
          title: "Account Updated!",
          description: "Your account details have been updated.",
        });
        setIsEditing(false);
      } catch {
        toast({
          title: "Could not Update Account",
          description: "Your account could not be updated. Please try again later",
          variant: "destructive",
        });
      }
    },
    [toast, updateUser, user]
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Stack>
          <h1 className="text-lg">Account Details</h1>
          <p className="text-sm">
            Your username and email are listed below. You can change them by clicking the <i>Edit Account Information </i>
            button below. This will take effect upon saving, and you will need to use the new username/email address when
            logging in in the future.
          </p>
          <FormInput name="username" readOnly={!isEditing} label="Username" className="sm:pr-[50%]" />
          <FormInput name="email" readOnly={!isEditing} label="Email Address" type="email" className="sm:pr-[50%]" />
          <div className="flex flex-row gap-2">
            <span className="mr-auto" />
            {!isEditing && <Button onClick={() => setIsEditing(true)}>Edit Account Information</Button>}
            {isEditing && (
              <Button variant="secondary" onClick={onCancel}>
                Cancel
              </Button>
            )}
            {isEditing && <SubmitButton>Save Account Details</SubmitButton>}
          </div>
        </Stack>
      </form>
    </Form>
  );
};
