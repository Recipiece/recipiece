import { zodResolver } from "@hookform/resolvers/zod";
import { FC, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button, Form, FormFile, FormSelect, LoadingSpinner, SelectItem, Stack, SubmitButton } from "../../component";
import { useResponsiveDialogComponents } from "../../hooks";
import { BaseDialogProps } from "../BaseDialogProps";

const SUPPORTED_FILES = [
  {
    format: "paprika",
    extensions: [".paprikarecipes"],
    display: "Paprika",
  },
];

const ImportRecipesFormSchema = z.object({
  file: z
    .instanceof(FileList)
    .refine((fileData) => !!fileData && !!fileData[0], "Select a file")
    .refine((fileData) => {
      return fileData[0].size <= 40000000;
    }, "File must be under 40 MB"),
  source: z
    .string()
    .refine((val) => SUPPORTED_FILES.map((f) => f.format).includes(val), "File must come from a supported application"),
});

export type ImportRecipesForm = z.infer<typeof ImportRecipesFormSchema>;

export const ImportRecipesDialog: FC<BaseDialogProps<ImportRecipesForm>> = ({ onSubmit, onClose }) => {
  const { ResponsiveContent, ResponsiveHeader, ResponsiveDescription, ResponsiveTitle, ResponsiveFooter } =
    useResponsiveDialogComponents();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ImportRecipesForm>({
    resolver: zodResolver(ImportRecipesFormSchema),
    defaultValues: {},
  });

  const onRequestRecipesImport = async (data: ImportRecipesForm) => {
    setIsSubmitting(true);
    try {
      await onSubmit?.(data);
    } catch {
      // noop
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedSource = form.watch("source");

  const availableExtensions = useMemo(() => {
    return (SUPPORTED_FILES.find((f) => f.format === selectedSource)?.extensions ?? []).join(",");
  }, [selectedSource]);

  return (
    <ResponsiveContent className="p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onRequestRecipesImport)}>
          <Stack>
            <ResponsiveHeader>
              <ResponsiveTitle>Import Recipes</ResponsiveTitle>
              <ResponsiveDescription>Import a recipe archive from another application.</ResponsiveDescription>
            </ResponsiveHeader>

            <FormSelect disabled={isSubmitting} name="source" label="Source Application">
              {SUPPORTED_FILES.map((entry, idx) => {
                return (
                  <SelectItem key={idx} value={entry.format}>
                    {entry.display}
                  </SelectItem>
                );
              })}
            </FormSelect>
            <FormFile
              disabled={isSubmitting}
              required
              type="file"
              name="file"
              label="File"
              accept={availableExtensions}
            />

            <ResponsiveFooter>
              <Button variant="outline" disabled={isSubmitting} onClick={() => onClose?.()}>
                Cancel
              </Button>
              <SubmitButton disabled={isSubmitting} className="min-w-20">
                {!isSubmitting && "Upload"}
                {isSubmitting && <LoadingSpinner className="h-5 w-5" />}
              </SubmitButton>
            </ResponsiveFooter>
          </Stack>
        </form>
      </Form>
    </ResponsiveContent>
  );
};
