import { FC, PropsWithChildren, useMemo } from "react";
import { cn } from "../../../util";

export const H2: FC<PropsWithChildren & { readonly className?: string }> = ({ children, className }) => {
  const fullClassName = useMemo(() => {
    return cn("scroll-m-20 border-b dark:border-b-foreground pb-2 text-3xl font-semibold tracking-tight first:mt-0", className);
  }, [className]);

  return <h2 className={fullClassName}>{children}</h2>;
};
