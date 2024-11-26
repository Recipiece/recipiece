import { zodResolver } from "@hookform/resolvers/zod";
import { FC, useContext } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button, Form, FormInput, Stack, SubmitButton } from "../../component";
import { DialogContext } from "../../context";
import { useResponsiveDialogComponents } from "../../hooks";
import { BaseDialogProps } from "../BaseDialogProps";

export interface CreateShoppingListDialogProps extends BaseDialogProps<CreateShoppingListForm> {}

const CreateShoppingListFormSchema = z.object({
  name: z.string().max(50).min(1, "A name is required"),
});

export type CreateShoppingListForm = z.infer<typeof CreateShoppingListFormSchema>;

export const CreateShoppingListDialog: FC<CreateShoppingListDialogProps> = ({ onSubmit }) => {
  const { ResponsiveContent, ResponsiveHeader, ResponsiveDescription, ResponsiveTitle, ResponsiveFooter } = useResponsiveDialogComponents();
  const { popDialog } = useContext(DialogContext);

  const form = useForm<CreateShoppingListForm>({
    resolver: zodResolver(CreateShoppingListFormSchema),
    defaultValues: {
      name: "",
    },
  });

  const { isSubmitting } = form.formState;

  const onCreateShoppingList = async (formData: CreateShoppingListForm) => {
    await Promise.resolve(onSubmit?.(formData));
    popDialog("createShoppingList");
  };

  return (
    <ResponsiveContent className="p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onCreateShoppingList)}>
          <ResponsiveHeader className="mb-4">
            <ResponsiveTitle>Create Shopping List</ResponsiveTitle>
            <ResponsiveDescription>Create a new shopping list.</ResponsiveDescription>
          </ResponsiveHeader>

          <Stack>
            <FormInput placeholder="What do you want to call your shopping list?" name="name" type="text" label="Name" />
          </Stack>

          <ResponsiveFooter className="mt-4 flex-col-reverse">
            <Button disabled={isSubmitting} type="button" variant="outline" onClick={() => popDialog("createShoppingList")}>
              Cancel
            </Button>
            <SubmitButton>Create Shopping List</SubmitButton>
          </ResponsiveFooter>
        </form>
      </Form>
    </ResponsiveContent>
  );
};
