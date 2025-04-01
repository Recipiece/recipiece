import { FC } from "react";
import { cn } from "../../../util";
import { Header } from "./Header";

export const RecipieceHeader: FC<{ readonly className?: string }> = ({ className }) => {
  return <Header className={cn("handlee-regular text-center", className)}>Recipiece</Header>;
};
