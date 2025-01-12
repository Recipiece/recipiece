import { FC, PropsWithChildren, ReactNode } from "react";
import { useFormContext } from "react-hook-form";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, Select, SelectContent, SelectTrigger, SelectValue } from "../../shadcn";

export interface FormSelectProps extends PropsWithChildren {
  readonly name: string;
  readonly instructions?: string;
  readonly placeholder?: string;
  readonly label?: string;
  readonly className?: string;
  readonly isLoading?: boolean;
  readonly required?: boolean;
  readonly disabled?: boolean;
}

export const FormSelect: FC<FormSelectProps> = ({ children, name, label, instructions, placeholder, required, disabled }) => {
  const form = useFormContext();

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {label && <FormLabel>{label}</FormLabel>}
          <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value} required={required} disabled={disabled}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={placeholder ?? ""} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {(children as ReactNode[]).map((node) => {
                return node;
              })}
            </SelectContent>
          </Select>
          {instructions && <FormDescription>{instructions}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
