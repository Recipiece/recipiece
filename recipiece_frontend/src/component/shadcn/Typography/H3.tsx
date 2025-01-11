import { FC, PropsWithChildren, useMemo } from "react";
import { cn } from "../../../util";

export const H3: FC<PropsWithChildren & { readonly className?: string }> = ({ children, className }) => {
  const fullClassName = useMemo(() => {
    return cn("scroll-m-20 text-2xl font-semibold tracking-tight", className);
  }, [className]);

  return <h3 className={fullClassName}>{children}</h3>;
};
