import { FC, PropsWithChildren, useMemo } from "react";
import { cn } from "../../../util";

export const H4: FC<PropsWithChildren & { readonly className?: string }> = ({ children, className }) => {
  const fullClassName = useMemo(() => {
    return cn("scroll-m-20 text-xl font-semibold tracking-tight", className);
  }, [className]);

  return <h4 className={fullClassName}>{children}</h4>;
};
