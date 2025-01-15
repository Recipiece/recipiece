import { FC } from "react";
import { cn } from "../../../util";

export const Divider: FC<{ readonly className?: string }> = ({ className }) => {
  return <hr className={cn("dark:border-muted", className)} />;
};
