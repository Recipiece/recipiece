import { zodResolver } from "@hookform/resolvers/zod";
import Fraction from "fraction.js";
import { FC, useCallback } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button, Form, FormInput, SubmitButton } from "../../component";
import { useResponsiveDialogComponents } from "../../hooks";
import { BaseDialogProps } from "../BaseDialogProps";

export interface ScaleRecipeSubmit {
  readonly scaleFactor: number;
}

export interface ScaleRecipeDialogProps extends BaseDialogProps<ScaleRecipeSubmit> {}

const ScaleRecipeFormSchema = z.object({
  amount: z.string().superRefine((value, ctx) => {
    try {
      const fractional = new Fraction(value);
      if (fractional.lte(0)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Enter a value greater than 0",
        });
      }
    } catch {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Enter a number or fraction.",
      });
    }
  }),
});

export type ScaleRecipeForm = z.infer<typeof ScaleRecipeFormSchema>;

export const ScaleRecipeDialog: FC<ScaleRecipeDialogProps> = ({ onClose, onSubmit }) => {
  const { ResponsiveContent, ResponsiveHeader, ResponsiveDescription, ResponsiveTitle, ResponsiveFooter } =
    useResponsiveDialogComponents();

  const form = useForm<ScaleRecipeForm>({
    resolver: zodResolver(ScaleRecipeFormSchema),
    defaultValues: {
      amount: "1",
    },
  });

  const onScale = useCallback(
    (formData: ScaleRecipeForm) => {
      onSubmit?.({
        scaleFactor: new Fraction(formData.amount).valueOf(),
      });
    },
    [onSubmit]
  );

  const { isSubmitting } = form.formState;

  return (
    <ResponsiveContent className="p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onScale)}>
          <ResponsiveHeader className="mb-4">
            <ResponsiveTitle>Scale Recipe</ResponsiveTitle>
            <ResponsiveDescription>Enter a number or fraction to scale the recipe by.</ResponsiveDescription>
          </ResponsiveHeader>

          <div className="flex flex-row items-end gap-2">
            <FormInput
              placeholder="How much more or less do you want?"
              name="amount"
              label="Scale By"
              required
              className="flex-grow"
            />
          </div>

          <ResponsiveFooter className="mt-4 flex-col-reverse">
            <Button disabled={isSubmitting} type="button" variant="outline" onClick={() => onClose?.()}>
              Cancel
            </Button>
            <SubmitButton>Scale Recipe</SubmitButton>
          </ResponsiveFooter>
        </form>
      </Form>
    </ResponsiveContent>
  );
};
