import { DataTestId } from "@recipiece/constant";
import { Grip, Minus, PlusIcon } from "lucide-react";
import mergeRefs from "merge-refs";
import { FC, Fragment, useCallback, useMemo } from "react";
import { useDrag, useDrop } from "react-dnd";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Button, FormTextarea } from "../../component";
import { cn } from "../../util";

export interface StepsFormProps {
  readonly isLoading: boolean;
}

interface StepFormItemProps {
  readonly index: number;
  readonly onRemove: (index: number) => void;
  readonly onMove: (srcIndex: number, destIndex: number) => void;
  readonly draggable: boolean;
}

const StepFormItem: FC<StepFormItemProps> = ({ index, onRemove, onMove, draggable }) => {
  const [{ isDragging }, dragRef, draggingRef] = useDrag(() => {
    return {
      type: "edit_recipe_step",
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
      accept: "edit_recipe_step",
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
    const baseClassName = "flex flex-col gap-1 w-full";
    if (isDragging) {
      return "hidden";
    } else if (isOver) {
      return cn(baseClassName, "pt-16");
    } else {
      return cn(baseClassName);
    }
  }, [isDragging, isOver]);

  return (
    // @ts-expect-error mergeRefs has slightly off type definition
    <div className={wrapperClassName} ref={mergeRefs(dropRef, draggingRef)}>
      <div className="flex flex-row items-center gap-2">
        {draggable && (
          <div data-testid={DataTestId.RecipeEditPage.DIV_STEP_DROP_TARGET(index)} ref={dragRef}>
            <Grip data-testid={DataTestId.RecipeEditPage.STEP_DRAG_HANDLE(index)} className="cursor-grab text-primary" />
          </div>
        )}
        <p className="mr-auto leading-6">Step {index + 1}</p>
        <Button data-testid={DataTestId.RecipeEditPage.BUTTON_REMOVE_STEP(index)} variant="link" onClick={() => onRemove(index)}>
          <Minus className="text-destructive" />
        </Button>
      </div>
      <FormTextarea
        data-testid={DataTestId.RecipeEditPage.TEXTAREA_STEP_CONTENT(index)}
        readOnly={isDragging}
        name={`steps.${index}.content`}
        placeholder="What should you do?"
        required
      />
    </div>
  );
};

export const StepsForm: FC<StepsFormProps> = () => {
  const form = useFormContext();

  const stepsFieldArray = useFieldArray({
    control: form?.control,
    name: "steps",
  });

  const addStep = useCallback(() => {
    stepsFieldArray.append({
      content: "",
    });
  }, [stepsFieldArray]);

  const removeStep = useCallback(
    (index: number) => {
      stepsFieldArray.remove(index);
    },
    [stepsFieldArray]
  );

  const moveStep = useCallback(
    (srcIndex: number, destIndex: number) => {
      stepsFieldArray.move(srcIndex, destIndex);
    },
    [stepsFieldArray]
  );

  return (
    <div>
      <div className="mb-2 flex flex-row items-center">
        <h1 className="inline text-lg">Steps</h1>
        <Button data-testid={DataTestId.RecipeEditPage.BUTTON_ADD_STEP} type="button" onClick={addStep} variant="secondary" className="ml-auto">
          <PlusIcon />
          Add Step
        </Button>
      </div>
      {stepsFieldArray.fields.map((fieldArrayValue, index) => {
        return (
          <Fragment key={fieldArrayValue.id}>
            <StepFormItem draggable={stepsFieldArray.fields.length > 1} index={index} onRemove={removeStep} onMove={moveStep} />
          </Fragment>
        );
      })}
    </div>
  );
};
