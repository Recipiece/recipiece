import { DataTestId } from "@recipiece/constant";
import { FC, ReactElement, useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { cn } from "../../../util";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, Textarea, TextareaProps } from "../../shadcn";
import { LoadingGroup } from "../LoadingGroup";

export interface FormTextareaProps extends TextareaProps {
  readonly name: string;
  readonly instructions?: ReactElement;
  readonly label?: string;
  readonly className?: string;
  readonly isLoading?: boolean;
}

export const FormTextarea: FC<FormTextareaProps> = ({ isLoading, name, instructions, label, className, ...restProps }) => {
  const form = useFormContext();
  const { isSubmitting } = form.formState;

  // @ts-expect-error data test id is not type on the props
  const dataTestId = restProps?.["data-testid"];

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
          <FormItem data-testid={DataTestId.Form.CONTAINER(dataTestId)} className={fullClassName}>
            {label && <FormLabel data-testid={DataTestId.Form.LABEL(dataTestId)}>{label}</FormLabel>}
            <FormControl>
              <LoadingGroup isLoading={!!isLoading} className="h-20">
                <Textarea {...restProps} {...field} />
              </LoadingGroup>
            </FormControl>
            {instructions && <FormDescription data-testid={DataTestId.Form.DESCRIPTION(dataTestId)}>{instructions}</FormDescription>}
            <FormMessage data-testid={DataTestId.Form.MESSAGE(dataTestId)} />
          </FormItem>
        );
      }}
    />
  );
};
