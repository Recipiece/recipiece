import { zodResolver } from "@hookform/resolvers/zod";
import { FC } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Button,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Form,
  FormCheckbox,
  FormInput,
  FormTextarea,
  Stack,
  SubmitButton,
} from "../../component";
import { BaseDialogProps } from "../BaseDialogProps";

const CreateCookbookFormSchema = z.object({
  name: z.string().max(50).min(1, "A name is required"),
  description: z.string().max(1000).optional(),
  private: z.boolean().default(false),
});

export type CreateCookbookForm = z.infer<typeof CreateCookbookFormSchema>;

export const CreateCookbookDialog: FC<BaseDialogProps<CreateCookbookForm>> = ({ onClose, onSubmit }) => {
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
    <DialogContent className="max-w-[360px] sm:max-w-[450px]">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onCreateCookbook)}>
          <DialogHeader className="mb-4">
            <DialogTitle>Create Cookbook</DialogTitle>
            <DialogDescription>Create a new cookbook to store your recipes in.</DialogDescription>
          </DialogHeader>

          <Stack>
            <FormInput placeholder="What do you want to call your cookbook?" name="name" type="text" label="Name" />
            <FormTextarea placeholder="What is this cookbook all about?" name="description" label="Description" />
            <FormCheckbox name="private" label="Private" />
          </Stack>

          <DialogFooter className="mt-4">
            <Button disabled={isSubmitting} type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <SubmitButton>Create Cookbook</SubmitButton>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};
