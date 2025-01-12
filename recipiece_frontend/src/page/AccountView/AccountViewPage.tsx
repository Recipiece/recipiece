import { FC } from "react";
import { Stack, Tabs, TabsContent, TabsList, TabsTrigger } from "../../component";
import { AboutTab } from "./AboutTab";
import { AccountTab } from "./AccountTab";
import { DataTab } from "./DataTab";

export const AccountViewPage: FC = () => {
  return (
    <Stack>
      <Tabs defaultValue="account">
        <TabsList className="w-full items-left justify-start">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="data">Data</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
        </TabsList>

        <TabsContent value="account">
          <AccountTab />
        </TabsContent>
        <TabsContent value="data">
          <DataTab />
        </TabsContent>
        <TabsContent value="about">
          <AboutTab />
        </TabsContent>
      </Tabs>
    </Stack>
  );
};
