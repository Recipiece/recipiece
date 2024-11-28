import { FC, useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { cn } from "../../../util";
import { Checkbox, CheckboxProps, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../../shadcn";

export interface FormCheckboxProps extends CheckboxProps {
  readonly name: string;
  readonly instructions?: string;
  readonly label?: string;
  readonly className?: string;
  readonly isLoading?: boolean;
}

export const FormCheckbox: FC<FormCheckboxProps> = ({ isLoading, name, className, label, instructions, ...restInputProps }) => {
  const form = useFormContext();
  const { isSubmitting } = form.formState;

  const fullClassName = useMemo(() => {
    return cn(className ?? "", "flex flex-row");
  }, [className]);

  return (
    <FormField
      control={form.control}
      name={name}
      disabled={isSubmitting}
      render={({ field }) => {
        return (
          <FormItem className={fullClassName}>
            <FormControl>
              <Checkbox checked={field.value} onCheckedChange={field.onChange} {...restInputProps} {...field} />
            </FormControl>
            {/* Something is overriding the usual mt-0 class that i'd use here, so set the style directly */}
            {label && (
              <FormLabel className="inline ml-2" style={{ marginTop: "0" }}>
                {label}
              </FormLabel>
            )}
            <FormMessage />
            {instructions && <FormDescription>{instructions}</FormDescription>}
          </FormItem>
        );
      }}
    />
  );
};
