import { FC, ReactElement, useMemo } from "react";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, Textarea, TextareaProps } from "../../shadcn";
import { useFormContext } from "react-hook-form";
import { cn } from "../../../util";
import { DataTestID } from "@recipiece/constant";

export interface FormTextareaProps extends TextareaProps {
  readonly name: string;
  readonly instructions?: ReactElement;
  readonly label?: string;
  readonly className?: string;
}

export const FormTextarea: FC<FormTextareaProps> = ({ name, instructions, label, className, ...restProps }) => {
  const form = useFormContext();
  const { isSubmitting } = form.formState;

  // @ts-expect-error data test id is not type on the props
  const dataTestId = restInputProps?.["data-testid"];

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
          <FormItem data-testid={DataTestID.CommonForm.forContainer(dataTestId)} className={fullClassName}>
            {label && <FormLabel data-testid={DataTestID.CommonForm.forLabel(dataTestId)}>{label}</FormLabel>}
            <FormControl>
              <Textarea {...restProps} {...field} />
            </FormControl>
            {instructions && <FormDescription data-testid={DataTestID.CommonForm.forInstructions(dataTestId)}>{instructions}</FormDescription>}
            <FormMessage data-testid={DataTestID.CommonForm.forMessage(dataTestId)} />
          </FormItem>
        );
      }}
    />
  );
};
