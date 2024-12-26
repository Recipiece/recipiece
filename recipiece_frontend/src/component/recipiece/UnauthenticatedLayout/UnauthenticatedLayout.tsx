import { FC } from "react";
import { Outlet } from "react-router-dom";
import { RecipieceHeader } from "../Typography";
import "./UnauthenticatedLayout.css";

export const UnauthenticatedLayout: FC = () => {
  return (
    <div className="flex flex-row h-full overflow-hidden">
      <div className="hidden sm:inline-block basis-1/2 flex-grow-0 flex-shrink-0 recipiece-striped">
        <div className="recipiece-striped-utensils"></div>
        <div className="recipiece-striped-pot"></div>
      </div>
      <div className="basis-full sm:basis-1/2 flex flex-col shadow-md p-8 md:p-6 sm:p-4 flex-grow-0 flex-shrink-0">
        <div className="mt-auto mb-auto">
          <RecipieceHeader className="text-primary mb-4" />
          <Outlet />
        </div>
      </div>
    </div>
  );
};
