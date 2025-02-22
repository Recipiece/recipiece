import { FC, useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { cn } from "../../../util";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, Input, InputProps } from "../../shadcn";
import { DataTestID } from "@recipiece/constant";

export interface FormInputProps extends InputProps {
  readonly name: string;
  readonly instructions?: string;
  readonly label?: string;
  readonly className?: string;
  readonly isLoading?: boolean;
}

export const FormInput: FC<FormInputProps> = ({ isLoading, name, className, label, instructions, onBlur, ...restInputProps }) => {
  const form = useFormContext();
  const { isSubmitting } = form.formState;

  // @ts-expect-error data test id is not type on the props
  const dataTestId = restInputProps?.["data-testid"];

  const fullClassName = useMemo(() => {
    return cn(className ?? "");
  }, [className]);

  return (
    <FormField
      control={form.control}
      name={name}
      disabled={isSubmitting}
      render={({ field }) => {
        return (
          <FormItem data-testid={DataTestID.CommonForm.forContainer(dataTestId)} className={fullClassName}>
            {label && <FormLabel data-testid={DataTestID.CommonForm.forLabel(dataTestId)}>{label}</FormLabel>}
            <FormControl>
              <Input
                {...restInputProps}
                {...field}
                onBlur={(event) => {
                  event.preventDefault();
                  if (onBlur) {
                    onBlur?.(event);
                  } else {
                    field.onBlur();
                  }
                }}
              />
            </FormControl>
            <FormMessage data-testid={DataTestID.CommonForm.forMessage(dataTestId)} />
            {instructions && <FormDescription data-testid={DataTestID.CommonForm.forInstructions(dataTestId)}>{instructions}</FormDescription>}
          </FormItem>
        );
      }}
    />
  );
};
