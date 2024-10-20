import { FC, PropsWithChildren, useMemo } from "react";
import { Skeleton } from "../../shadcn";
import { cn } from "../../../util";

export interface LoadingGroupProps extends PropsWithChildren {
  readonly isLoading: boolean;
  readonly className?: string;
}

export const LoadingGroup: FC<LoadingGroupProps> = ({
  children,
  isLoading,
  className,
}) => {
  const fullClassName = useMemo(() => {
    if (className) {
      return cn("rounded-xl", className);
    } else {
      return cn("w-[250px] rounded-xl");
    }
  }, [className]);

  return (
    <>
      {isLoading && <Skeleton className={fullClassName} />}
      {!isLoading && <>{children}</>}
    </>
  );
};
