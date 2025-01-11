import { FC, PropsWithChildren } from "react";

export const Lead: FC<PropsWithChildren> = ({ children }) => {
  return <p className="text-xl text-muted-foreground">{children}</p>;
};
