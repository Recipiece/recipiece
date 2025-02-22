import { FC, PropsWithChildren, ReactNode } from "react";
import { useFormContext } from "react-hook-form";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, Select, SelectContent, SelectTrigger, SelectValue } from "../../shadcn";
import { DataTestID } from "@recipiece/constant";

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

  // @ts-expect-error data test id is not type on the props
  const dataTestId = restInputProps?.["data-testid"];

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem data-testid={DataTestID.CommonForm.forContainer(dataTestId)}>
          {label && <FormLabel data-testid={DataTestID.CommonForm.forLabel(dataTestId)}>{label}</FormLabel>}
          <Select data-testid={dataTestId} onValueChange={field.onChange} defaultValue={field.value} value={field.value} required={required} disabled={disabled}>
            <FormControl>
              <SelectTrigger data-testid={DataTestID.CommonForm.forSelectTrigger(dataTestId)}>
                <SelectValue placeholder={placeholder ?? ""} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {(children as ReactNode[]).map((node) => {
                return node;
              })}
            </SelectContent>
          </Select>
          {instructions && <FormDescription data-testid={DataTestID.CommonForm.forInstructions(dataTestId)}>{instructions}</FormDescription>}
          <FormMessage data-testid={DataTestID.CommonForm.forMessage(dataTestId)} />
        </FormItem>
      )}
    />
  );
};
