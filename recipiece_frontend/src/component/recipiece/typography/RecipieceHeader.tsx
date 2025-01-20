import { FC } from "react";
import { Header } from "./Header";
import { cn } from "../../../util";

export const RecipieceHeader: FC<{ readonly className?: string }> = ({ className }) => {
  return <Header className={cn("handlee-regular text-center", className)}>Recipiece</Header>;
};
