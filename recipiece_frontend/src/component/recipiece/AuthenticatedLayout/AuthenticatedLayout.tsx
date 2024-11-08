import { FC } from "react";
import { Outlet } from "react-router-dom";
import { RecipieceFooter } from "../RecipieceFooter";
import { RecipieceMenubar } from "../RecipieceMenuBar";

export const AuthenticatedLayout: FC = () => {
  return (
    <div>
      <RecipieceMenubar />
      <div className="h-full w-full p-2 sm:p-4 mb-12 sm:mb-0">
        <Outlet />
      </div>
      <RecipieceFooter />
    </div>
  )
}