import { zodResolver } from "@hookform/resolvers/zod";
import { FC, useContext } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button, Form, FormCheckbox, FormInput, FormTextarea, Stack, SubmitButton } from "../../component";
import { DialogContext } from "../../context";
import { BaseDialogProps } from "../BaseDialogProps";
import { useResponsiveDialogComponents } from "../../hooks";

const CreateCookbookFormSchema = z.object({
  name: z.string().max(50).min(1, "A name is required"),
  description: z.string().max(1000).optional(),
  private: z.boolean().default(false),
});

export type CreateCookbookForm = z.infer<typeof CreateCookbookFormSchema>;

export const CreateCookbookDialog: FC<BaseDialogProps<CreateCookbookForm>> = ({ onSubmit }) => {
  const { ResponsiveContent, ResponsiveHeader, ResponsiveDescription, ResponsiveFooter, ResponsiveTitle } = useResponsiveDialogComponents();
  const { popDialog } = useContext(DialogContext);

  const form = useForm<CreateCookbookForm>({
    resolver: zodResolver(CreateCookbookFormSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const { isSubmitting } = form.formState;

  const onCreateCookbook = async (formData: CreateCookbookForm) => {
    console.log(formData);
    try {
      await Promise.resolve(onSubmit?.(formData));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <ResponsiveContent className="p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onCreateCookbook)}>
          <ResponsiveHeader className="mb-4">
            <ResponsiveTitle>Create Cookbook</ResponsiveTitle>
            <ResponsiveDescription>Create a new cookbook to store your recipes in.</ResponsiveDescription>
          </ResponsiveHeader>

          <Stack>
            <FormInput placeholder="What do you want to call your cookbook?" name="name" type="text" label="Name" />
            <FormTextarea placeholder="What is this cookbook all about?" name="description" label="Description" />
            <FormCheckbox name="private" label="Private" />
          </Stack>

          <ResponsiveFooter className="mt-4 flex-col-reverse">
            <Button disabled={isSubmitting} type="button" variant="outline" onClick={() => popDialog("createCookbook")}>
              Cancel
            </Button>
            <SubmitButton>Create Cookbook</SubmitButton>
          </ResponsiveFooter>
        </form>
      </Form>
    </ResponsiveContent>
  );
};
