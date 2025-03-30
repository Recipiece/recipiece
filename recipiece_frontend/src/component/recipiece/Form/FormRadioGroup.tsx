"use client";

import { DataTestId } from "@recipiece/constant";
import { FC, Fragment, PropsWithChildren } from "react";
import { useFormContext } from "react-hook-form";
import { cn } from "../../../util";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, RadioGroup, RadioGroupItem } from "../../shadcn";

export interface FormRadioGroupProps extends PropsWithChildren {
  readonly isLoading?: boolean;
  readonly layout?: "horizontal" | "vertical";
  readonly label?: string;
  readonly instructions?: string;
  readonly name: string;
}

export interface FormRadioGroupItemProps extends React.ComponentProps<typeof RadioGroupItem> {
  readonly label: string;
}

export const FormRadioGroupItem: FC<FormRadioGroupItemProps> = ({ label, ...restProps }) => {
  return (
    <FormItem className="flex flex-row gap-2 items-center">
      <FormControl>
        <RadioGroupItem {...restProps} />
      </FormControl>
      <FormLabel className="font-normal pb-">{label}</FormLabel>
    </FormItem>
  );
};

export const FormRadioGroup: FC<FormRadioGroupProps> = ({ children, isLoading, name, layout = "vertical", label, instructions, ...restInputProps }) => {
  const form = useFormContext();

  const radioGroupLayoutClassName = layout === "vertical" ? "flex flex-col gap-2" : "flex flex-row gap-2";

  // @ts-expect-error data test id is not type on the props
  const dataTestId = restInputProps?.["data-testid"];

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem data-testid={DataTestId.Form.CONTAINER(dataTestId)}>
          {label && <FormLabel data-testid={DataTestId.Form.LABEL(dataTestId)}>{label}</FormLabel>}
          <FormControl>
            <RadioGroup disabled={isLoading} onValueChange={field.onChange} value={field.value} defaultValue={field.value} className={cn(radioGroupLayoutClassName)}>
              {((children ?? []) as React.ReactNode[]).map((ch, idx) => {
                return <Fragment key={idx}>{ch}</Fragment>;
              })}
            </RadioGroup>
          </FormControl>
          {instructions && <FormDescription data-testid={DataTestId.Form.DESCRIPTION(dataTestId)}>{instructions}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
