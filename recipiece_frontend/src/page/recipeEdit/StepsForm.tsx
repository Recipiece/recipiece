import { ArrowDown, ArrowUp, PlusIcon, XIcon } from "lucide-react";
import { FC, useCallback } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import {
  Button,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  LoadingGroup,
  Textarea
} from "../../component";

export interface StepsFormProps {
  readonly isLoading: boolean;
}

export const StepsForm: FC<StepsFormProps> = ({ isLoading }) => {
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

  const onStepUp = useCallback(
    (index: number) => {
      stepsFieldArray.swap(index, index - 1);
    },
    [stepsFieldArray]
  );

  const onStepDown = useCallback(
    (index: number) => {
      stepsFieldArray.swap(index, index + 1);
    },
    [stepsFieldArray]
  );

  return (
    <div>
      <div className="flex flex-row items-center mb-2">
        <h1 className="inline text-lg">Steps</h1>
        <Button
          type="button"
          onClick={addStep}
          variant="secondary"
          className="ml-auto"
        >
          <PlusIcon />
          Add Step
        </Button>
      </div>
      {stepsFieldArray.fields.map((fieldArrayValue, index) => {
        return (
          <div key={fieldArrayValue.id}>
            <div className="flex flex-row items-center justify-start mb-2">
              <Button
                disabled={index === 0}
                className="ms-0 ps-0"
                type="button"
                variant="link"
                onClick={() => onStepUp(index)}
              >
                <ArrowUp />
              </Button>
              <p className="inline leading-9">{index + 1}.</p>
              <Button
                disabled={index === stepsFieldArray.fields.length - 1}
                // className="m-0 p-0"
                type="button"
                variant="link"
                onClick={() => onStepDown(index)}
              >
                <ArrowDown />
              </Button>

              <Button
                variant="link"
                onClick={() => removeStep(index)}
                type="button"
                className="ms-auto pr-0"
              >
                <XIcon />
              </Button>
            </div>
            <FormField
              control={form.control}
              name={`steps.${index}.content`}
              render={({ field }) => {
                return (
                  <FormItem>
                    <LoadingGroup
                      isLoading={isLoading}
                      className="w-1/3 h-[138px]"
                    >
                      <FormControl>
                        <Textarea
                          placeholder="What should you do?"
                          required
                          {...field}
                        />
                      </FormControl>
                    </LoadingGroup>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
          </div>
        );
      })}
    </div>
  );
};
