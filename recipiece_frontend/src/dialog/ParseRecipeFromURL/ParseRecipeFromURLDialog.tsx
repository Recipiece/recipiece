import { zodResolver } from "@hookform/resolvers/zod";
import { FC, PropsWithChildren, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Form,
  FormInput,
  Stack,
  SubmitButton
} from "../../component";

const ParseRecipeFromURLFormSchema = z.object({
  url: z.string().url().min(1, "Enter a URL"),
});

export type ParseRecipeFromURLForm = z.infer<typeof ParseRecipeFromURLFormSchema>;

export interface ParseRecipeFromURLDialogProps extends PropsWithChildren {
  readonly isOpen: boolean;
  readonly setIsOpen: (value: boolean) => void;
  readonly onSubmit: (data: ParseRecipeFromURLForm) => Promise<void>;
}

export const ParseRecipeFromURLDialog: FC<ParseRecipeFromURLDialogProps> = ({ children, isOpen, setIsOpen, onSubmit }) => {
  const form = useForm<ParseRecipeFromURLForm>({
    resolver: zodResolver(ParseRecipeFromURLFormSchema),
    defaultValues: {
      url: "",
    },
  });

  const { isSubmitting } = form.formState;

  useEffect(() => {
    if (!isOpen) {
      form.reset({
        url: "",
      });
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {children}
      <DialogContent className="max-w-[360px] sm:max-w-[450px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader className="mb-4">
              <DialogTitle>Create a Recipe from a URL</DialogTitle>
              <DialogDescription>Create a recipe from a URL. Be sure to double check the results!</DialogDescription>
            </DialogHeader>

            <Stack>
              <FormInput placeholder="URL" name="url" type="text" label="URL" />
            </Stack>

            <DialogFooter className="mt-4">
              <Button disabled={isSubmitting} type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <SubmitButton>Create Recipe</SubmitButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
