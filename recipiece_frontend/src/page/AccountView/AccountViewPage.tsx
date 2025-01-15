import { FC } from "react";
import { Stack, Tabs, TabsContent, TabsList, TabsTrigger } from "../../component";
import { AboutTab } from "./AboutTab";
import { AccountTab } from "./AccountTab";
import { DataTab } from "./DataTab";
import { PreferencesTab } from "./PreferencesTab";

export const AccountViewPage: FC = () => {
  return (
    <Stack>
      <Tabs defaultValue="preferences">
        <TabsList className="w-full items-left justify-start">
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="data">Data</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
        </TabsList>

        <TabsContent value="preferences">
          <PreferencesTab />
        </TabsContent>
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
