import { FC } from "react";
import { Outlet } from "react-router-dom";
import { RecipieceHeader } from "../Typography";
import "./UnauthenticatedLayout.css";

export const UnauthenticatedLayout: FC = () => {
  return (
    <div className="flex flex-row h-full overflow-hidden">
      <div className="hidden lg:inline-block basis-1/2 flex-grow-0 flex-shrink-0 recipiece-striped"></div>
      <div className="basis-full lg:basis-1/2 flex flex-col shadow-md p-8 md:p-6 sm:p-4 flex-grow-0 flex-shrink-0">
        <div className="mt-auto mb-auto">
          <RecipieceHeader className="text-primary dark:text-white mb-4" />
          <Outlet />
        </div>
      </div>
    </div>
  );
};
