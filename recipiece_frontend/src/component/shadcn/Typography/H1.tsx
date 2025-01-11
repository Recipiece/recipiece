import { FC, PropsWithChildren, useMemo } from "react";
import { cn } from "../../../util";

export const H1: FC<PropsWithChildren & { readonly className?: string }> = ({ children, className }) => {
  const fullClassName = useMemo(() => {
    return cn("scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl", className);
  }, [className]);

  return <h1 className={fullClassName}>{children}</h1>;
};
