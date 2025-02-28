import { FC, PropsWithChildren } from "react";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, Switch } from "../../shadcn";
import { useFormContext } from "react-hook-form";
import { cn } from "../../../util";
import { DataTestId } from "@recipiece/constant";

export interface FormSwitchProps extends PropsWithChildren {
  readonly name: string;
  readonly instructions?: string;
  readonly label?: string;
  readonly className?: string;
  readonly isLoading?: boolean;
  readonly disabled?: boolean;
}

export const FormSwitch: FC<FormSwitchProps> = ({ name, instructions, label, className, disabled }) => {
  const form = useFormContext();

  // @ts-expect-error data test id is not type on the props
  const dataTestId = restInputProps?.["data-testid"];

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem data-testid={DataTestId.Form.CONTAINER(dataTestId)} className={cn("flex flex-col gap-2", className)}>
          {label && <FormLabel data-testid={DataTestId.Form.LABEL(dataTestId)}>{label}</FormLabel>}
          <FormControl>
            <Switch data-testid={dataTestId} disabled={disabled} checked={field.value} onCheckedChange={field.onChange} />
          </FormControl>
          <FormMessage data-testid={DataTestId.Form.MESSAGE(dataTestId)} />
          {instructions && <FormDescription data-testid={DataTestId.Form.DESCRIPTION(dataTestId)}>{instructions}</FormDescription>}
        </FormItem>
      )}
    />
  );
};
