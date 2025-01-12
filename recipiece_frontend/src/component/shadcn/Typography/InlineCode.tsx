import { FC, PropsWithChildren, useMemo } from "react";
import { cn } from "../../../util";

export const InlineCode: FC<PropsWithChildren & { readonly className?: string }> = ({ children, className }) => {
  const fullClassName = useMemo(() => {
    return cn("relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold", className);
  }, [className]);

  return <code className={fullClassName}>{children}</code>;
};
