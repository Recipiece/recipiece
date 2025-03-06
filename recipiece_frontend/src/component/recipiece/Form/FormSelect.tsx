import { DataTestId } from "@recipiece/constant";
import { FC, PropsWithChildren, ReactNode } from "react";
import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "../../shadcn";

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

export const FormSelect: FC<FormSelectProps> = ({
  children,
  name,
  label,
  instructions,
  placeholder,
  required,
  disabled,
  ...restInputProps
}) => {
  const form = useFormContext();

  // @ts-expect-error data test id is not type on the props
  const dataTestId = restInputProps?.["data-testid"];

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem data-testid={DataTestId.Form.CONTAINER(dataTestId)}>
          {label && <FormLabel data-testid={DataTestId.Form.LABEL(dataTestId)}>{label}</FormLabel>}
          <Select
            data-testid={dataTestId}
            onValueChange={field.onChange}
            defaultValue={field.value}
            value={field.value}
            required={required}
            disabled={disabled}
            {...(restInputProps ?? {})}
          >
            <FormControl>
              <SelectTrigger data-testid={DataTestId.Form.SELECT_TRIGGER(dataTestId)}>
                <SelectValue placeholder={placeholder ?? ""} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {(children as ReactNode[]).map((node) => {
                return node;
              })}
            </SelectContent>
          </Select>
          {instructions && (
            <FormDescription data-testid={DataTestId.Form.DESCRIPTION(dataTestId)}>{instructions}</FormDescription>
          )}
          <FormMessage data-testid={DataTestId.Form.MESSAGE(dataTestId)} />
        </FormItem>
      )}
    />
  );
};
