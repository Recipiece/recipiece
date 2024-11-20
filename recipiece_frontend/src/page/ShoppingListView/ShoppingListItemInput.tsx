import { FC } from "react";
import { Input, InputProps } from "../../component";
import { cn } from "../../util";

export const ShoppingListItemInput: FC<InputProps> = ({ className, ...restProps }) => {
  return <Input className={cn("outline-none ring-0 border-y-0 border-b-[1px] border-r-0 rounded-t-none rounded-br-none rounded-bl-md p-1 h-auto focus-visible:ring-0", className)} {...restProps} />;
};
