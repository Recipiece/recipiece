import { FC, useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { cn } from "../../../util";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, Input, InputProps } from "../../shadcn";

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
          <FormItem className={fullClassName}>
            {label && <FormLabel>{label}</FormLabel>}
            <FormControl>
              <Input {...restInputProps} {...field} onBlur={(event) => {
                field.onBlur();
                onBlur?.(event);
              }} />
            </FormControl>
            <FormMessage />
            {instructions && <FormDescription>{instructions}</FormDescription>}
          </FormItem>
        );
      }}
    />
  );
};
