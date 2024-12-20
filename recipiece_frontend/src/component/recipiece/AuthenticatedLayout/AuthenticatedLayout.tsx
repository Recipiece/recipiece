import { FC } from "react";
import { Outlet } from "react-router-dom";
import { RecipieceMenubar, RecipieceMenuBarContextProvider } from "../RecipieceMenuBar";

export const AuthenticatedLayout: FC = () => {
  return (
    <div>
      <RecipieceMenuBarContextProvider>
        <RecipieceMenubar />
        <div className="w-full h-full p-2 sm:p-4 mb-12 sm:mb-0">
          <Outlet />
          <div className="h-14 sm:h-0" />
        </div>
      </RecipieceMenuBarContextProvider>
    </div>
  );
};
