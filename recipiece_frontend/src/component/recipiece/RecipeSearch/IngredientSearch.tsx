import { DataTestId } from "@recipiece/constant";
import { XIcon } from "lucide-react";
import { FC, useCallback } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Badge } from "../../shadcn";
import { FormInput } from "../Form";
import { RecipeSearchForm } from "./RecipeSearchFormSchema";

export const IngredientSearch: FC<{ readonly disabled?: boolean; readonly dataTestId?: string }> = ({
  disabled,
  dataTestId,
}) => {
  const form = useFormContext<RecipeSearchForm>();

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "ingredients",
  });
  const currentIng = form.watch("currentIngredientTerm");

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Enter") {
        event.preventDefault();
        const sanitized = currentIng.trim();
        const currentIngs = fields.map((ing) => ing.name);

        if (sanitized.length > 0 && !currentIngs.includes(sanitized)) {
          append({ name: sanitized });
        }

        form.setValue("currentIngredientTerm", "");
      }
    },
    [append, currentIng, fields, form]
  );

  return (
    <div className="flex flex-col gap-2">
      <FormInput
        data-testid={DataTestId.RecipeSearchBar.INPUT_INGREDIENT_SEARCH(dataTestId)}
        disabled={disabled}
        name="currentIngredientTerm"
        onKeyDown={onKeyDown}
        placeholder="Enter an ingredient..."
        label="Containing Ingredients"
      />
      <div className="flex flex-row flex-wrap">
        {fields.map((field, index) => {
          return (
            <Badge
              data-testid={`${DataTestId.RecipeSearchBar.BADGE_INGREDIENT(dataTestId)}-${index}`}
              key={field.id}
              className="cursor-pointer dark:text-white"
              onClick={() => remove(index)}
            >
              {field.name} <XIcon className="ml-2" size={12} />
            </Badge>
          );
        })}
      </div>
    </div>
  );
};
