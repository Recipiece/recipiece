import { FC, PropsWithChildren } from "react";
import { RecipieceMenubar } from "../RecipieceMenuBar";
import { RecipieceFooter } from "../RecipieceFooter";

export const AuthenticatedLayout: FC<PropsWithChildren> = ({children}) => {
  return (
    <div>
      <RecipieceMenubar />
      <div className="h-full p-2 sm:p-4 mb-12 sm:mb-0">
        {children}
      </div>
      <RecipieceFooter />
    </div>
  )
}