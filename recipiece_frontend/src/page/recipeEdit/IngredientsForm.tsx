import { Grip, Minus, PlusIcon } from "lucide-react";
import mergeRefs from "merge-refs";
import { FC, Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Button, FormInput, Popover, PopoverContent, PopoverTrigger } from "../../component";
import { ALL_UNITS, cn } from "../../util";

const UNIT_AUTOCOMPLETE_OPTIONS = ALL_UNITS.map((au) => {
  return au.display_name.singular;
});

export interface IngredientsFormProps {
  readonly isLoading: boolean;
}

interface IngredientFormItemProps {
  readonly index: number;
  readonly onRemove: (index: number) => void;
  readonly onMove: (srcIndex: number, destIndex: number) => void;
  readonly draggable: boolean;
  readonly onKeyDown: (event: React.KeyboardEvent) => void;
}

const IngredientFormNameInput: FC<{ readonly isDragging: boolean; readonly index: number; readonly onKeyDown: (event: React.KeyboardEvent) => void }> = ({
  isDragging,
  index,
  onKeyDown,
}) => {
  return (
    <FormInput
      onKeyDown={(event) => {
        onKeyDown(event);
      }}
      className="flex-grow"
      autoComplete="off"
      readOnly={isDragging}
      name={`ingredients.${index}.name`}
      key={`name.${index}`}
      placeholder="Name"
      required={true}
    />
  );
};

const IngredientFormAmountInput: FC<{ readonly isDragging: boolean; readonly index: number; readonly onKeyDown: (event: React.KeyboardEvent) => void }> = ({
  isDragging,
  index,
  onKeyDown,
}) => {
  return (
    <FormInput
      onKeyDown={(event) => {
        onKeyDown(event);
      }}
      className="flex-grow"
      autoComplete="off"
      readOnly={isDragging}
      name={`ingredients.${index}.amount`}
      key={`amount.${index}`}
      placeholder="Amount"
    />
  );
};

const IngredientFormUnitInput: FC<{ readonly isDragging: boolean; index: number; onKeyDown: (event: React.KeyboardEvent) => void }> = ({ isDragging, index, onKeyDown }) => {
  const form = useFormContext();
  const currentUnit = form.watch(`ingredients.${index}.unit`);
  const [currentAutocompleteItems, setCurrentAutocompleteItems] = useState<string[]>([]);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  useEffect(() => {
    if (currentUnit?.length >= 1) {
      const newUnits = UNIT_AUTOCOMPLETE_OPTIONS.filter((opt) => {
        return opt.toLowerCase().startsWith(currentUnit.toLowerCase().trim()) && opt.toLowerCase() !== currentUnit.toLowerCase().trim();
      });
      setCurrentAutocompleteItems(newUnits);
      setIsPopoverOpen(newUnits.length > 0);
    } else {
      setCurrentAutocompleteItems([]);
      setIsPopoverOpen(false);
    }
  }, [currentUnit]);

  const onSelectItem = useCallback(
    (item: string) => {
      form.setValue(`ingredients.${index}.unit`, item);
      setIsPopoverOpen(false);
    },
    [form, index]
  );

  return (
    <Popover open={isPopoverOpen}>
      <div>
        <FormInput
          onKeyDown={(event) => {
            onKeyDown(event);
          }}
          className="flex-grow"
          autoComplete="off"
          readOnly={isDragging}
          name={`ingredients.${index}.unit`}
          key={`unit.${index}`}
          placeholder="Unit"
        />
        <div className="ml-4 h-0 w-0">
          <PopoverTrigger className="h-0 w-0" />
          <PopoverContent
            alignOffset={-16}
            align="start"
            className="p-1 min-w-[200px]"
            side="bottom"
            sideOffset={-14}
            onOpenAutoFocus={(event) => event.preventDefault()}
            onCloseAutoFocus={(event) => event.preventDefault()}
            avoidCollisions={false}
          >
            <div className="grid grid-cols-1">
              {currentAutocompleteItems.map((item) => {
                return (
                  <Button className="justify-start p-1 h-auto" variant="ghost" key={item} onClick={() => onSelectItem(item)}>
                    {item}
                  </Button>
                );
              })}
            </div>
          </PopoverContent>
        </div>
      </div>
    </Popover>
  );
};

const IngredientFormItem: FC<IngredientFormItemProps> = ({ index, onRemove, onMove, draggable, onKeyDown }) => {
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
    // const baseClassName = "grid gap-1 grid-flow-row sm:grid-flow-col content-center mb-2";
    const baseClassName = "flex flex-col sm:flex-row gap-1 mb-2";
    if (isOver) {
      return cn(baseClassName, "pt-24 sm:pt-12");
    } else if (isDragging) {
      return cn(baseClassName, "opacity-50");
    } else {
      return cn(baseClassName);
    }
  }, [isOver, isDragging]);

  return (
    // @ts-ignore
    <div className={wrapperClassName} ref={mergeRefs(dropRef, draggingRef)}>
      <div ref={dragRef} className="flex flex-row sm:block">
        {draggable && <Grip className="h-full m-0 p-0 cursor-grab text-primary flex-shrink" />}
        <Button className="block sm:hidden m-0 p-0 ml-auto" type="button" variant="link" onClick={() => onRemove(index)}>
          <Minus className="text-destructive" />
        </Button>
      </div>
      <IngredientFormNameInput onKeyDown={onKeyDown} isDragging={isDragging} index={index} />
      <IngredientFormAmountInput onKeyDown={onKeyDown} isDragging={isDragging} index={index} />
      <IngredientFormUnitInput onKeyDown={onKeyDown} isDragging={isDragging} index={index} />
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

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Enter") {
        event.preventDefault();
        addIngredient();
      }
    },
    [addIngredient]
  );

  return (
    <div>
      <div className="flex flex-row items-center mb-4">
        <h1 className="inline text-lg">Ingredients</h1>
        <Button type="button" onClick={addIngredient} variant="secondary" className="ml-auto">
          <PlusIcon />
          Add Ingredient
        </Button>
      </div>
      {ingredientsFieldArray.fields.map((fieldArrayValue, index) => {
        return (
          <Fragment key={fieldArrayValue.id}>
            <IngredientFormItem onKeyDown={onKeyDown} draggable={ingredientsFieldArray.fields.length > 1} index={index} onRemove={removeIngredient} onMove={onMoveIngredient} />
          </Fragment>
        );
      })}
    </div>
  );
};
