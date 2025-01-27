import { FC, PropsWithChildren } from "react";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, Switch } from "../../shadcn";
import { useFormContext } from "react-hook-form";
import { cn } from "../../../util";

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

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn("flex flex-col gap-2", className)}>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <Switch disabled={disabled} checked={field.value} onCheckedChange={field.onChange} />
          </FormControl>
          <FormMessage />
          {instructions && <FormDescription>{instructions}</FormDescription>}
        </FormItem>
      )}
    />
  );
};
