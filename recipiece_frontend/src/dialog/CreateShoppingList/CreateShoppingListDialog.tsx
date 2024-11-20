import { zodResolver } from "@hookform/resolvers/zod";
import { FC, useContext } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Form, FormInput, Stack, SubmitButton } from "../../component";
import { DialogContext } from "../../context";
import { BaseDialogProps } from "../BaseDialogProps";

export interface CreateShoppingListDialogProps extends BaseDialogProps<CreateShoppingListForm> {
}

const CreateShoppingListFormSchema = z.object({
  name: z.string().max(50).min(1, "A name is required"),
});

export type CreateShoppingListForm = z.infer<typeof CreateShoppingListFormSchema>;

export const CreateShoppingListDialog: FC<CreateShoppingListDialogProps> = ({
  onSubmit
}) => {
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
    <DialogContent className="max-w-[360px] sm:max-w-[450px]">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onCreateShoppingList)}>
          <DialogHeader className="mb-4">
            <DialogTitle>Create Shopping List</DialogTitle>
            <DialogDescription>Create a new shopping list.</DialogDescription>
          </DialogHeader>

          <Stack>
            <FormInput placeholder="What do you want to call your shopping list?" name="name" type="text" label="Name" />
          </Stack>

          <DialogFooter className="mt-4">
            <Button disabled={isSubmitting} type="button" variant="outline" onClick={() => popDialog("createShoppingList")}>
              Cancel
            </Button>
            <SubmitButton>Create Shopping List</SubmitButton>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
}