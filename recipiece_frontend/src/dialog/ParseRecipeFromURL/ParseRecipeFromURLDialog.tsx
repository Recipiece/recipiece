import { zodResolver } from "@hookform/resolvers/zod";
import { FC } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button, Form, FormInput, Stack, SubmitButton } from "../../component";
import { useResponsiveDialogComponents } from "../../hooks";
import { BaseDialogProps } from "../BaseDialogProps";

const ParseRecipeFromURLFormSchema = z.object({
  url: z.string().url().min(1, "Enter a URL"),
});

export type ParseRecipeFromURLForm = z.infer<typeof ParseRecipeFromURLFormSchema>;

export const ParseRecipeFromURLDialog: FC<BaseDialogProps<ParseRecipeFromURLForm>> = ({ onClose, onSubmit }) => {
  const { ResponsiveContent, ResponsiveHeader, ResponsiveDescription, ResponsiveTitle, ResponsiveFooter } = useResponsiveDialogComponents();

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
    <ResponsiveContent className="p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onParseRecipe)}>
          <ResponsiveHeader className="mb-4">
            <ResponsiveTitle>Create a Recipe from a URL</ResponsiveTitle>
            <ResponsiveDescription>Create a recipe from a URL. Be sure to double check the results!</ResponsiveDescription>
          </ResponsiveHeader>

          <FormInput placeholder="URL" name="url" type="text" label="URL" />

          <ResponsiveFooter className="mt-4 flex-col-reverse">
            <Button disabled={isSubmitting} type="button" variant="outline" onClick={() => onClose?.()}>
              Cancel
            </Button>
            <SubmitButton>Create Recipe</SubmitButton>
          </ResponsiveFooter>
        </form>
      </Form>
    </ResponsiveContent>
  );
};
