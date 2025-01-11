import { FC, PropsWithChildren } from "react";
import { useFormContext } from "react-hook-form";
import { Button, ButtonProps } from "../../shadcn";

export const SubmitButton: FC<ButtonProps & PropsWithChildren> = ({ children, disabled, ...restProps }) => {
  const form = useFormContext();
  const { isSubmitting } = form.formState;

  return (
    <Button disabled={disabled || isSubmitting} {...restProps} type="submit">
      {children}
    </Button>
  );
};
