import { FC, PropsWithChildren } from "react";

export const Stack: FC<PropsWithChildren> = ({ children }) => {
  return <div className="grid grid-cols-1 gap-2 sm:gap-4">{children}</div>;
};

export const StackSpacer: FC = () => {
  return <div className="col-span-1"></div>;
};
