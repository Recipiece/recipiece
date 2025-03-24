import { zodResolver } from "@hookform/resolvers/zod";
import { DataTestId } from "@recipiece/constant";
import { FC, useContext, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button, Form, FormInput, FormTextarea, Stack, SubmitButton } from "../../component";
import { DialogContext } from "../../context";
import { useResponsiveDialogComponents } from "../../hooks";
import { BaseDialogProps } from "../BaseDialogProps";

const CreateCookbookFormSchema = z.object({
  name: z.string().max(50).min(1, "A name is required"),
  description: z.string().max(1000).optional(),
});

export type CreateCookbookForm = z.infer<typeof CreateCookbookFormSchema>;

export const CreateCookbookDialog: FC<BaseDialogProps<CreateCookbookForm>> = ({ onSubmit }) => {
  const { ResponsiveContent, ResponsiveHeader, ResponsiveDescription, ResponsiveFooter, ResponsiveTitle } = useResponsiveDialogComponents();
  const { popDialog } = useContext(DialogContext);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateCookbookForm>({
    resolver: zodResolver(CreateCookbookFormSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const onCreateCookbook = async (formData: CreateCookbookForm) => {
    setIsSubmitting(true);
    try {
      await onSubmit?.(formData);
    } catch {
      // noop
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ResponsiveContent className="p-6" data-testid={DataTestId.Dialog.CreateCookbookDialog.DIALOG_WRAPPER}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onCreateCookbook)}>
          <ResponsiveHeader className="mb-4">
            <ResponsiveTitle>Create Cookbook</ResponsiveTitle>
            <ResponsiveDescription>Create a new cookbook to store your recipes in.</ResponsiveDescription>
          </ResponsiveHeader>

          <Stack>
            <FormInput
              data-testid={DataTestId.Dialog.CreateCookbookDialog.INPUT_COOKBOOK_NAME}
              disabled={isSubmitting}
              placeholder="What do you want to call your cookbook?"
              name="name"
              type="text"
              label="Name"
            />
            <FormTextarea
              data-testid={DataTestId.Dialog.CreateCookbookDialog.INPUT_COOKBOOK_DESCRIPTION}
              disabled={isSubmitting}
              placeholder="What is this cookbook all about?"
              name="description"
              label="Description"
            />
          </Stack>

          <ResponsiveFooter className="mt-4 flex-col-reverse">
            <Button disabled={isSubmitting} type="button" variant="outline" onClick={() => popDialog("createCookbook")}>
              Cancel
            </Button>
            <SubmitButton data-testid={DataTestId.Dialog.CreateCookbookDialog.BUTTON_SUBMIT} disabled={isSubmitting}>
              Create Cookbook
            </SubmitButton>
          </ResponsiveFooter>
        </form>
      </Form>
    </ResponsiveContent>
  );
};
