import { FC, PropsWithChildren } from "react";

export const Stack: FC<PropsWithChildren> = ({ children }) => {
  return <div className="grid gap-2 sm:gap-4 grid-cols-1">{children}</div>;
};

export const StackSpacer: FC = () => {
  return <div className="col-span-1"></div>;
};
