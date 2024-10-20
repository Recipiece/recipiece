import { FC, PropsWithChildren } from "react";
import { RecipieceMenubar } from "../../menubar";
import { RecipieceFooter } from "../../footer";

export const AuthenticatedLayout: FC<PropsWithChildren> = ({children}) => {
  return (
    <div>
      <RecipieceMenubar />
      <div className="h-full mb-12 sm:mb-0">
        {children}
      </div>
      <RecipieceFooter />
    </div>
  )
}