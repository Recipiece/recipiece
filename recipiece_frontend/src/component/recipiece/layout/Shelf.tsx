import { FC, PropsWithChildren } from "react";

export const Shelf: FC<PropsWithChildren> = ({ children }) => {
  return <div className="flex flex-row">{children}</div>;
};

export const ShelfSpacer: FC = () => {
  return <div className="ml-auto"></div>;
};
