import { zodResolver } from "@hookform/resolvers/zod";
import { RecipeIngredientSchema } from "@recipiece/types";
import Fraction from "fraction.js";
import { FC, useCallback } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button, Form, FormInput, SubmitButton } from "../../component";
import { useResponsiveDialogComponents } from "../../hooks";
import { formatIngredientAmount } from "../../util";
import { BaseDialogProps } from "../BaseDialogProps";

export interface RelativeScaleIngredientSubmit {
  readonly scaleFactor: number;
}

export interface RelativeScaleIngredientDialogProps extends BaseDialogProps<RelativeScaleIngredientSubmit> {
  readonly ingredient: RecipeIngredientSchema & { amount: string };
}

const RelativeScaleIngredientFormSchema = z.object({
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

export type RelativeScaleIngredientForm = z.infer<typeof RelativeScaleIngredientFormSchema>;

export const RelativeScaleIngredientDialog: FC<RelativeScaleIngredientDialogProps> = ({
  onClose,
  onSubmit,
  ingredient,
}) => {
  const { ResponsiveContent, ResponsiveHeader, ResponsiveDescription, ResponsiveTitle, ResponsiveFooter } =
    useResponsiveDialogComponents();

  const form = useForm<RelativeScaleIngredientForm>({
    resolver: zodResolver(RelativeScaleIngredientFormSchema),
    defaultValues: {
      amount: formatIngredientAmount(ingredient.amount),
    },
  });

  const onScale = useCallback(
    (formData: RelativeScaleIngredientForm) => {
      const oldAmount = new Fraction(ingredient.amount);
      const newAmount = new Fraction(formData.amount);
      const factor = newAmount.div(oldAmount).valueOf();
      onSubmit?.({
        scaleFactor: factor,
      });
    },
    [ingredient, onSubmit]
  );

  const { isSubmitting } = form.formState;

  return (
    <ResponsiveContent className="p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onScale)}>
          <ResponsiveHeader className="mb-4">
            <ResponsiveTitle>Scale Recipe Relative to Ingredient</ResponsiveTitle>
            <ResponsiveDescription>
              This recipe calls for {formatIngredientAmount(ingredient.amount)} {ingredient.unit ?? ""} of{" "}
              {ingredient.name}. If you only have a certain amount of {ingredient.name} on hand, you can scale the rest
              of the recipe relative to that amount.
              <br />
              <br />
              This may affect cooking/baking time and serving sizes!
            </ResponsiveDescription>
          </ResponsiveHeader>

          <div className="flex flex-row items-end gap-2">
            <FormInput
              placeholder="How much do you currently have?"
              name="amount"
              label="New Amount"
              required
              className="flex-grow"
            />
            <span>{ingredient.unit ?? ""}</span>
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
