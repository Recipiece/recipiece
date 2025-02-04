import { FC } from "react";
import { Outlet } from "react-router-dom";
import { RecipieceMenubar, RecipieceMenuBarContextProvider } from "../RecipieceMenuBar";

export const AuthenticatedLayout: FC = () => {
  return (
    <div>
      <RecipieceMenuBarContextProvider>
        <RecipieceMenubar />
        <div className="mb-12 h-full w-full p-2 sm:mb-0 sm:p-4">
          <Outlet />
          <div className="h-14 sm:h-0" />
        </div>
      </RecipieceMenuBarContextProvider>
    </div>
  );
};
