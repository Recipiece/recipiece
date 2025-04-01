import { FC, useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Stack, Tabs, TabsContent, TabsList, TabsTrigger } from "../../component";
import { AboutTab } from "./AboutTab";
import { AccountTab } from "./AccountTab";
import { DataTab } from "./DataTab";
import { PreferencesTab } from "./PreferencesTab";

const TAB_PREFERENCES = "preferences";
const TAB_ACCOUNT = "account";
const TAB_DATA = "data";
const TAB_ABOUT = "about";

export const AccountViewPage: FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (!searchParams.get("tab")) {
      setSearchParams({
        tab: TAB_PREFERENCES,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onTabChange = useCallback(
    (tabId: string) => {
      setSearchParams((prev) => {
        return {
          ...prev,
          tab: tabId,
        };
      });
    },
    [setSearchParams]
  );

  return (
    <Stack>
      <Tabs defaultValue={searchParams.get("tab") ?? TAB_PREFERENCES} onValueChange={onTabChange}>
        <TabsList className="items-left w-full justify-start">
          <TabsTrigger value={TAB_PREFERENCES}>Preferences</TabsTrigger>
          <TabsTrigger value={TAB_ACCOUNT}>Account</TabsTrigger>
          <TabsTrigger value={TAB_DATA}>Data</TabsTrigger>
          <TabsTrigger value={TAB_ABOUT}>About</TabsTrigger>
        </TabsList>

        <TabsContent value={TAB_PREFERENCES}>
          <PreferencesTab />
        </TabsContent>
        <TabsContent value={TAB_ACCOUNT}>
          <AccountTab />
        </TabsContent>
        <TabsContent value={TAB_DATA}>
          <DataTab />
        </TabsContent>
        <TabsContent value={TAB_ABOUT}>
          <AboutTab />
        </TabsContent>
      </Tabs>
    </Stack>
  );
};
