import { FC, useMemo } from "react";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, Textarea, TextareaProps } from "../../shadcn";
import { useFormContext } from "react-hook-form";
import { cn } from "../../../util";

export interface FormTextareaProps extends TextareaProps {
  readonly name: string;
  readonly instructions?: string;
  readonly label?: string;
  readonly className?: string;
}

export const FormTextarea: FC<FormTextareaProps> = ({ name, instructions, label, className, ...restProps }) => {
  const form = useFormContext();

  const fullClassName = useMemo(() => {
    return cn(className ?? "");
  }, [className]);

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => {
        return (
          <FormItem className={fullClassName}>
            {label && <FormLabel>{label}</FormLabel>}
            <FormControl>
              <Textarea {...restProps} {...field} />
            </FormControl>
            {instructions && <FormDescription>{instructions}</FormDescription>}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
};
