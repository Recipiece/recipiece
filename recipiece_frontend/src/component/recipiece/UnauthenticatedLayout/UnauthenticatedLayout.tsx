import { FC } from "react";
import { Outlet } from "react-router-dom";
import { TurnstileContextProvider } from "../../../context";
import { RecipieceHeader } from "../Typography";
import "./UnauthenticatedLayout.css";

export const UnauthenticatedLayout: FC = () => {
  return (
    <TurnstileContextProvider>
      <div className="flex h-full flex-row overflow-hidden">
        <div className="recipiece-striped hidden flex-shrink-0 flex-grow-0 basis-1/2 lg:inline-block"></div>
        <div className="flex flex-shrink-0 flex-grow-0 basis-full flex-col bg-card p-8 shadow-md sm:p-4 md:p-6 lg:basis-1/2">
          <div className="mb-auto mt-auto">
            <RecipieceHeader className="mb-4 text-primary dark:text-white" />
            <Outlet />
          </div>
        </div>
      </div>
    </TurnstileContextProvider>
  );
};
