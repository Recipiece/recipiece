import { DataTestId } from "@recipiece/constant";
import { FC, useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { cn } from "../../../util";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, Input, InputProps } from "../../shadcn";
import { LoadingGroup } from "../LoadingGroup";

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
    <>
      <FormField
        control={form.control}
        name={name}
        disabled={isSubmitting}
        render={({ field }) => {
          return (
            <FormItem data-testid={DataTestId.Form.CONTAINER(dataTestId)} className={fullClassName}>
              {label && <FormLabel data-testid={DataTestId.Form.LABEL(dataTestId)}>{label}</FormLabel>}
              <FormControl>
                <LoadingGroup isLoading={!!isLoading} className="w-full h-10">
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
                </LoadingGroup>
              </FormControl>
              <FormMessage data-testid={DataTestId.Form.MESSAGE(dataTestId)} />
              {instructions && <FormDescription data-testid={DataTestId.Form.DESCRIPTION(dataTestId)}>{instructions}</FormDescription>}
            </FormItem>
          );
        }}
      />
    </>
  );
};
