import { FC, useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { cn } from "../../../util";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, Input, InputProps } from "../../shadcn";

export interface FormFileProps extends InputProps {
  readonly name: string;
  readonly instructions?: string;
  readonly label?: string;
  readonly className?: string;
  readonly isLoading?: boolean;
}

export const FormFile: FC<FormFileProps> = ({ isLoading, name, className, label, instructions, ...restInputProps }) => {
  const form = useFormContext();
  const fileRef = form.register(name);
  const { isSubmitting } = form.formState;

  const fullClassName = useMemo(() => {
    return cn(className ?? "");
  }, [className]);

  return (
    <FormField
      control={form.control}
      name={name}
      disabled={isSubmitting}
      render={() => {
        return (
          <FormItem className={fullClassName}>
            {label && <FormLabel>{label}</FormLabel>}
            <FormControl>
              <Input type="file" {...restInputProps} {...fileRef} />
            </FormControl>
            <FormMessage />
            {instructions && <FormDescription>{instructions}</FormDescription>}
          </FormItem>
        );
      }}
    />
  );
};
