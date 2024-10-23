import { FC, PropsWithChildren, useMemo } from "react";
import { cn } from "../../../util";

export interface GridProps extends PropsWithChildren {
  readonly className?: string;
}

export const Grid: FC<GridProps> = ({children, className}) => {
  const fullClassName = useMemo(() => {
    if(className) {
      return className;
    } else {
      return "grid-cols-1 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12";
    }
  }, [className]);

  return (
    <div className={cn("grid gap-2 sm:gap-4", fullClassName)}>
      {children}
    </div>
  )
}

export const GridRow: FC<PropsWithChildren> = ({children}) => {
  return (
    <div className="col-span-1 sm:col-span-4 md:col-span-6 lg:col-span-12 auto-rows-fr">
      {children}
    </div>
  )
}

export const GridHalfRow: FC<PropsWithChildren> = ({children}) => {
  return (
    <div className="col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-6 auto-rows-fr">
      {children}
    </div>
  )
}
