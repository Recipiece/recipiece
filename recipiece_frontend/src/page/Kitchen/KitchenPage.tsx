import { FC, useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { H2, Stack, Tabs, TabsContent, TabsList, TabsTrigger } from "../../component";
import { FromUserTable } from "./FromUserTable";
import { TargetingUserTable } from "./TargetingUserTable";

const TAB_TARGETING = "targeting";
const TAB_FROM = "from";

export const KitchenPage: FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (!searchParams.get("tab")) {
      setSearchParams({
        tab: TAB_TARGETING,
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
      <H2>Your Kitchen</H2>
      <Tabs defaultValue={searchParams.get("tab") ?? TAB_TARGETING} onValueChange={onTabChange}>
        <TabsList className="items-left w-full justify-start">
          <TabsTrigger value={TAB_TARGETING}>To You</TabsTrigger>
          <TabsTrigger value={TAB_FROM}>From You</TabsTrigger>
        </TabsList>

        <TabsContent value={TAB_TARGETING} className="pl-4 pr-4">
          <TargetingUserTable />
        </TabsContent>
        <TabsContent value={TAB_FROM} className="pl-4 pr-4">
          <FromUserTable />
        </TabsContent>
      </Tabs>
    </Stack>
  );
};
