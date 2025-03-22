import { FC, PropsWithChildren, useMemo } from "react";
import { cn } from "../../../util";
import { LoadingSpinner, Skeleton } from "../../shadcn";

export interface LoadingGroupProps extends PropsWithChildren {
  readonly isLoading: boolean;
  readonly className?: string;
  readonly variant?: "skeleton" | "spinner";
}

export const LoadingGroup: FC<LoadingGroupProps> = ({ children, isLoading, className, variant = "skeleton" }) => {
  const fullClassName = useMemo(() => {
    if (variant === "skeleton") {
      if (className) {
        return cn("rounded-xl", className);
      } else {
        return cn("w-[250px] rounded-xl");
      }
    } else {
      return cn("w-[150px] h-[150px]", className);
    }
  }, [className, variant]);

  return (
    <>
      {isLoading && variant === "skeleton" && <Skeleton className={fullClassName} />}
      {isLoading && variant === "spinner" && (
        <div className="flex flex-row justify-center">
          <LoadingSpinner className={fullClassName} />
        </div>
      )}
      {!isLoading && <>{children}</>}
    </>
  );
};
