import { DateTime } from "luxon";
import { FC, useMemo } from "react";
import { useGetSelfQuery } from "../../api";
import { LoadingGroup, Stack, Tabs, TabsContent, TabsList, TabsTrigger } from "../../component";
import { AccountTab } from "./AccountTab";

export const AccountViewPage: FC = () => {
  const { data: account, isLoading: isLoadingAccount } = useGetSelfQuery();

  const joinDate = useMemo(() => {
    if (account) {
      return DateTime.fromISO(account.created_at).toFormat("dd MMMM, y");
    }
    return undefined;
  }, [account]);

  return (
    <Stack>
      {/* <LoadingGroup isLoading={isLoadingAccount} className="w-full h-6">
        <h1 className="text-2xl">Welcome Back, {account?.username}</h1>
      </LoadingGroup>
      <LoadingGroup isLoading={isLoadingAccount}>
        <p className="text-sm">You joined Recipiece on {joinDate}.</p>
      </LoadingGroup> */}
      <Tabs defaultValue="account">
        <TabsList className="w-full items-left justify-start">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="data">Data</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
        </TabsList>

        <TabsContent value="account">
          <AccountTab />
        </TabsContent>
      </Tabs>

      {/* <hr />
      <VerifyAccountSection />
      <hr />
      <AccountManagementSection />
      <hr />
      <p className="text-sm">
        Interested in helping develop Recipiece? Found a bug perhaps?{" "}
        <a className="underline" target="blank" href="https://github.com/sjyn/Recipiece">
          Find us on GitHub
        </a>
        .
      </p>
      <p className="text-sm">
        Version <i>{process.env.REACT_APP_RECIPIECE_VERSION}</i>, December 2024
      </p> */}
    </Stack>
  );
};
