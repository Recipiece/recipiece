import { FC, PropsWithChildren, useEffect, useState } from "react";
import {
  Button,
  Dialog,
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
  useToast,
} from "../../component";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateCookbookMutation } from "../../api";

const CreateCookbookFormSchema = z.object({
  name: z.string().max(50).min(1, "A name is required"),
  description: z.string().max(1000).optional(),
  private: z.boolean().default(false),
});

type CreateCookbookForm = z.infer<typeof CreateCookbookFormSchema>;

export const CreateCookbookDialog: FC<PropsWithChildren> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const { mutateAsync: createCookbook } = useCreateCookbookMutation({
    onSuccess: () => {
      setIsOpen(false);
      toast({
        title: "Cookbook Created",
        description: "You can now add recipes to your new cookbook!",
      });
    },
  });

  const form = useForm<CreateCookbookForm>({
    resolver: zodResolver(CreateCookbookFormSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const { isSubmitting } = form.formState;

  useEffect(() => {
    if (!isOpen) {
      form.reset({
        name: "",
        description: "",
      });
    }
  }, [isOpen]);

  const onSubmit = async (formData: CreateCookbookForm) => {
    try {
      await createCookbook({ ...formData });
    } catch (error) {}
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {children}
      <DialogContent className="max-w-[360px] sm:max-w-[450px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
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
              <Button disabled={isSubmitting} type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <SubmitButton>Create Cookbook</SubmitButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
