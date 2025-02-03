import { FC } from "react";
import { H2, Stack, Tabs, TabsContent, TabsList, TabsTrigger } from "../../component";
import { FromUserTable } from "./FromUserTable";
import { TargetingUserTable } from "./TargetingUserTable";

export const KitchenPage: FC = () => {
  return (
    <Stack>
      <H2>Your Kitchen</H2>
      <Tabs defaultValue="targeting">
        <TabsList className="items-left w-full justify-start">
          <TabsTrigger value="targeting">To You</TabsTrigger>
          <TabsTrigger value="from">From You</TabsTrigger>
        </TabsList>

        <TabsContent value="targeting" className="pl-4 pr-4">
          <TargetingUserTable />
        </TabsContent>
        <TabsContent value="from" className="pl-4 pr-4">
          <FromUserTable />
        </TabsContent>
      </Tabs>
    </Stack>
  );
};
