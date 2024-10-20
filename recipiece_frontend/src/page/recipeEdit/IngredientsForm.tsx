import { ArrowDown, ArrowUp, PlusIcon, XIcon } from "lucide-react";
import { FC, useCallback } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import {
  Button,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  Input,
  LoadingGroup,
} from "../../component";

const ingredientFields = ["name", "amount", "unit"];

export interface IngredientsFormProps {
  readonly isLoading: boolean;
}

export const IngredientsForm: FC<IngredientsFormProps> = ({ isLoading }) => {
  const form = useFormContext();

  const ingredientsFieldArray = useFieldArray({
    control: form?.control,
    name: "ingredients",
  });

  const addIngredient = useCallback(() => {
    ingredientsFieldArray.append({
      name: "",
      unit: "",
      amount: "",
    });
  }, [ingredientsFieldArray]);

  const removeIngredient = useCallback(
    (index: number) => {
      ingredientsFieldArray.remove(index);
    },
    [ingredientsFieldArray]
  );

  const onIngredientUp = useCallback(
    (index: number) => {
      ingredientsFieldArray.swap(index, index - 1);
    },
    [ingredientsFieldArray]
  );

  const onIngredientDown = useCallback(
    (index: number) => {
      ingredientsFieldArray.swap(index, index + 1);
    },
    [ingredientsFieldArray]
  );

  return (
    <div>
      <div className="flex flex-row items-center mb-2">
        <h1 className="inline text-lg">Ingredients</h1>
        <Button
          type="button"
          onClick={addIngredient}
          variant="secondary"
          className="ml-auto"
        >
          <PlusIcon />
          Add Ingredient
        </Button>
      </div>
      {ingredientsFieldArray.fields.map((fieldArrayValue, index) => {
        return (
          <div
            key={fieldArrayValue.id}
            className="grid gap-2 grid-flow-col content-center mb-2"
          >
            <Button
              disabled={index === 0}
              className="m-0 p-0"
              type="button"
              variant="link"
              onClick={() => onIngredientUp(index)}
            >
              <ArrowUp />
            </Button>
            <p className="inline leading-9">{index + 1}.</p>
            <Button
              disabled={index === ingredientsFieldArray.fields.length - 1}
              className="m-0 p-0"
              type="button"
              variant="link"
              onClick={() => onIngredientDown(index)}
            >
              <ArrowDown />
            </Button>
            {ingredientFields.map((ingFieldName, indexY) => {
              return (
                <FormField
                  key={`${ingFieldName}.${indexY}`}
                  control={form.control}
                  // @ts-ignore
                  name={`ingredients.${index}.${ingFieldName}`}
                  render={({ field }) => {
                    return (
                      <FormItem>
                        <LoadingGroup
                          isLoading={isLoading}
                          className="w-1/3 h-[138px]"
                        >
                          <FormControl>
                            {/* @ts-ignore */}
                            <Input
                              placeholder={
                                ingFieldName.charAt(0).toUpperCase() +
                                ingFieldName.substring(1)
                              }
                              required={ingFieldName === "name"}
                              {...field}
                            />
                          </FormControl>
                        </LoadingGroup>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              );
            })}
            <Button
              className="m-0 p-0"
              type="button"
              variant="link"
              onClick={() => removeIngredient(index)}
            >
              <XIcon />
            </Button>
          </div>
        );
      })}
    </div>
  );
};
