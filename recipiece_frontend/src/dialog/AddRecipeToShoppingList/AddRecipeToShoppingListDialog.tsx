import { zodResolver } from "@hookform/resolvers/zod";
import { RecipeSchema } from "@recipiece/types";
import { FC, useCallback, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { Button, Form, FormCheckbox, ScrollArea, SubmitButton } from "../../component";
import { useResponsiveDialogComponents } from "../../hooks";
import { BaseDialogProps } from "../BaseDialogProps";

export interface AddRecipeToShoppingListDialogProps extends BaseDialogProps<AddRecipeToShoppingListForm> {
  readonly recipe: RecipeSchema;
}

const AddRecipeToShoppingListFormSchema = z.object({
  items: z.array(
    z.object({
      name: z.string(),
      selected: z.boolean(),
      notes: z.string().nullable().optional(),
    })
  ),
});

export type AddRecipeToShoppingListForm = z.infer<typeof AddRecipeToShoppingListFormSchema>;

export const AddRecipeToShoppingListDialog: FC<AddRecipeToShoppingListDialogProps> = ({ onSubmit, onClose, recipe }) => {
  const { ResponsiveContent, ResponsiveHeader, ResponsiveDescription, ResponsiveTitle, ResponsiveFooter } = useResponsiveDialogComponents();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AddRecipeToShoppingListForm>({
    resolver: zodResolver(AddRecipeToShoppingListFormSchema),
    defaultValues: {
      items: (recipe.ingredients ?? []).map((ing) => {
        let notesString = `${recipe.name} - `;
        if (ing.amount) {
          notesString += `${ing.amount} `;
        }
        if (ing.unit) {
          notesString += `${ing.unit} `;
        }
        return {
          name: ing.name,
          selected: true,
          notes: notesString.trim(),
        };
      }),
    },
  });

  const itemsFieldArray = useFieldArray({
    control: form?.control,
    name: "items",
  });

  const onAddToShoppingList = useCallback(
    async (data: AddRecipeToShoppingListForm) => {
      setIsSubmitting(true);
      try {
        await onSubmit?.(data);
      } catch {
        // noop
      } finally {
        setIsSubmitting(false);
      }
    },
    [onSubmit]
  );

  const onSelectAll = useCallback(() => {
    form.reset({
      items: (recipe.ingredients ?? []).map((ing) => {
        return {
          name: ing.name,
          selected: true,
        };
      }),
    });
  }, [form, recipe]);

  const onDeselectAll = useCallback(() => {
    form.reset({
      items: (recipe.ingredients ?? []).map((ing) => {
        return {
          name: ing.name,
          selected: false,
        };
      }),
    });
  }, [form, recipe]);

  return (
    <ResponsiveContent className="p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onAddToShoppingList)}>
          <ResponsiveHeader className="mb-4">
            <ResponsiveTitle>Add {recipe.name} to your shopping list</ResponsiveTitle>
            <ResponsiveDescription>Add the ingredients from {recipe.name} to your shopping list.</ResponsiveDescription>
          </ResponsiveHeader>

          <div>
            <Button disabled={isSubmitting} variant="link" onClick={onDeselectAll}>
              Deselect All
            </Button>
            <Button disabled={isSubmitting} variant="link" onClick={onSelectAll}>
              Select All
            </Button>
          </div>
          <ScrollArea className="mt-2 h-40 rounded-sm border-[1px] border-solid border-primary p-2 sm:h-[250px]">
            {itemsFieldArray.fields.map((fieldArrayValue, index) => {
              return (
                <div key={fieldArrayValue.id} className="pb-3">
                  <FormCheckbox disabled={isSubmitting} name={`items.${index}.selected`} label={fieldArrayValue.name} />
                </div>
              );
            })}
          </ScrollArea>

          <ResponsiveFooter className="mt-4 flex-col-reverse">
            <Button disabled={isSubmitting} type="button" variant="outline" onClick={() => onClose?.()}>
              Cancel
            </Button>
            <SubmitButton disabled={isSubmitting}>Add Ingredients</SubmitButton>
          </ResponsiveFooter>
        </form>
      </Form>
    </ResponsiveContent>
  );
};
