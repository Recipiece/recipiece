"use client";

import { DataTestId } from "@recipiece/constant";
import { FC } from "react";
import { useFormContext } from "react-hook-form";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, MultipleSelector, MultipleSelectorProps } from "../../shadcn";

export interface FormMultipleSelectorProps extends MultipleSelectorProps {
  readonly name: string;
  readonly label?: string;
  readonly instructions?: string;
}

export const FormMultipleSelector: FC<FormMultipleSelectorProps> = ({ name, label, instructions, ...restProps }) => {
  const form = useFormContext();

  // @ts-expect-error data test id is not type on the props
  const dataTestId = restProps?.["data-testid"];

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem data-testid={DataTestId.Form.CONTAINER(dataTestId)}>
          {label && <FormLabel data-testid={DataTestId.Form.LABEL(dataTestId)}>{label}</FormLabel>}
          <FormControl>
            <MultipleSelector data-testid={dataTestId} {...field} {...restProps} />
          </FormControl>
          {instructions && <FormDescription data-testid={DataTestId.Form.DESCRIPTION(dataTestId)}>{instructions}</FormDescription>}
          <FormMessage data-testid={DataTestId.Form.MESSAGE(dataTestId)} />
        </FormItem>
      )}
    />
  );
};
