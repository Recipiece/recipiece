import { FC } from "react";
import { Outlet } from "react-router-dom";
import { Card, CardContent, CardHeader } from "../../shadcn";
import { Header } from "../Typography";

export const UnauthenticatedLayout: FC = () => {
  return (
    <div className="flex flex-row h-full w-full">
      <div className="w-full p-2 sm:p-0 sm:w-2/3 m-auto">
        <Card>
          <CardHeader className="bg-primary text-white mb-4">
            <Header className="handlee-regular text-center">Recipiece</Header>
          </CardHeader>
          <CardContent>
            <Outlet />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
