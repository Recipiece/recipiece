import { zodResolver } from "@hookform/resolvers/zod";
import { FC } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Form, FormInput, Stack, SubmitButton } from "../../component";
import { BaseDialogProps } from "../BaseDialogProps";

const ParseRecipeFromURLFormSchema = z.object({
  url: z.string().url().min(1, "Enter a URL"),
});

export type ParseRecipeFromURLForm = z.infer<typeof ParseRecipeFromURLFormSchema>;

export const ParseRecipeFromURLDialog: FC<BaseDialogProps<ParseRecipeFromURLForm>> = ({ onClose, onSubmit }) => {
  const form = useForm<ParseRecipeFromURLForm>({
    resolver: zodResolver(ParseRecipeFromURLFormSchema),
    defaultValues: {
      url: "",
    },
  });

  const onParseRecipe = async (data: ParseRecipeFromURLForm) => {
    await Promise.resolve(onSubmit?.(data));
  };

  const { isSubmitting } = form.formState;

  return (
    <DialogContent className="max-w-[360px] sm:max-w-[450px]">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onParseRecipe)}>
          <DialogHeader className="mb-4">
            <DialogTitle>Create a Recipe from a URL</DialogTitle>
            <DialogDescription>Create a recipe from a URL. Be sure to double check the results!</DialogDescription>
          </DialogHeader>

          <Stack>
            <FormInput placeholder="URL" name="url" type="text" label="URL" />
          </Stack>

          <DialogFooter className="mt-4">
            <Button disabled={isSubmitting} type="button" variant="outline" onClick={() => onClose?.()}>
              Cancel
            </Button>
            <SubmitButton>Create Recipe</SubmitButton>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};
