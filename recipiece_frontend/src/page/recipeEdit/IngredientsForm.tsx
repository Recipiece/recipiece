import { Grip, Minus, PlusIcon } from "lucide-react";
import mergeRefs from "merge-refs";
import { FC, Fragment, useCallback, useMemo } from "react";
import { useDrag, useDrop } from "react-dnd";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Button, FormInput } from "../../component";
import { cn } from "../../util";

const ingredientFields = ["name", "amount", "unit"];

export interface IngredientsFormProps {
  readonly isLoading: boolean;
}

interface IngredientFormItemProps {
  readonly index: number;
  readonly onRemove: (index: number) => void;
  readonly onMove: (srcIndex: number, destIndex: number) => void;
  readonly draggable: boolean;
}

const IngredientFormItem: FC<IngredientFormItemProps> = ({ index, onRemove, onMove, draggable }) => {
  const [{ isDragging }, dragRef, draggingRef] = useDrag(() => {
    return {
      type: "edit_recipe_ingredient",
      item: { index: index },
      collect: (monitor) => {
        return {
          isDragging: !!monitor.isDragging(),
        };
      },
    };
  }, [index]);

  const [{ isOver }, dropRef] = useDrop(() => {
    return {
      accept: "edit_recipe_ingredient",
      drop: (droppedItem) => {
        onMove((droppedItem as { readonly index: number }).index, index);
      },
      collect: (monitor) => {
        return {
          isOver: monitor.isOver(),
        };
      },
    };
  }, [index, onMove]);

  const wrapperClassName = useMemo(() => {
    const baseClassName = "grid gap-1 grid-flow-row sm:grid-flow-col content-center mb-2";
    if (isOver) {
      return cn(baseClassName, "pt-24 sm:pt-12");
    } else if (isDragging) {
      return "hidden";
    } else {
      return cn(baseClassName);
    }
  }, [isOver, isDragging]);

  return (
    // @ts-ignore
    <div className={wrapperClassName} ref={mergeRefs(dropRef, draggingRef)}>
      <div ref={dragRef} className="flex flex-row sm:block">
        {draggable && <Grip className="h-full m-0 p-0 cursor-grab text-primary" />}
        <Button className="block sm:hidden m-0 p-0 ml-auto" type="button" variant="link" onClick={() => onRemove(index)}>
          <Minus className="text-destructive" />
        </Button>
      </div>
      {ingredientFields.map((ingFieldName, indexY) => {
        return (
          <FormInput
            autoComplete="off"
            readOnly={isDragging}
            name={`ingredients.${index}.${ingFieldName}`}
            key={`${ingFieldName}.${indexY}`}
            placeholder={ingFieldName.charAt(0).toUpperCase() + ingFieldName.substring(1)}
            required={ingFieldName === "name"}
          />
        );
      })}
      <Button className="hidden sm:block m-0 p-0" type="button" variant="link" onClick={() => onRemove(index)}>
        <Minus className="text-destructive" />
      </Button>
    </div>
  );
};

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

  const onMoveIngredient = useCallback(
    (srcIndex: number, destIndex: number) => {
      ingredientsFieldArray.move(srcIndex, destIndex);
    },
    [ingredientsFieldArray]
  );

  return (
    <div>
      <div className="flex flex-row items-center mb-2">
        <h1 className="inline text-lg">Ingredients</h1>
        <Button type="button" onClick={addIngredient} variant="secondary" className="ml-auto">
          <PlusIcon />
          Add Ingredient
        </Button>
      </div>
      {ingredientsFieldArray.fields.map((fieldArrayValue, index) => {
        return (
          <Fragment key={fieldArrayValue.id}>
            <IngredientFormItem draggable={ingredientsFieldArray.fields.length > 1} index={index} onRemove={removeIngredient} onMove={onMoveIngredient} />
          </Fragment>
        );
      })}
    </div>
  );
};
