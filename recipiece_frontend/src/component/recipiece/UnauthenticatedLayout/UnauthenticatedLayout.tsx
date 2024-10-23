import { FC, PropsWithChildren } from "react";
import { Card, CardContent, CardHeader } from "../../shadcn";
import { Header } from "../Typography";

export const UnauthenticatedLayout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="flex flex-row h-full">
      <div className="w-full sm:w-2/3 m-auto">
        <Card>
          <CardHeader className="bg-primary text-white mb-4">
            <Header className="handlee-regular text-center">Recipiece</Header>
          </CardHeader>
          <CardContent>{children}</CardContent>
        </Card>
      </div>
    </div>
  );
};
