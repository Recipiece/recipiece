import { DateTime } from "luxon";
import { FC, useMemo } from "react";
import { useGetSelfQuery } from "../../api";
import { LoadingGroup, Stack } from "../../component";
import { AccountManagementSection } from "./AccountManagementSection";
import { VerifyAccountSection } from "./VerifyAccountSection";

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
      <LoadingGroup isLoading={isLoadingAccount} className="w-full h-10">
        <h1 className="text-2xl">Welcome Back, {account?.email}</h1>
      </LoadingGroup>
      <LoadingGroup isLoading={isLoadingAccount}>
        <p className="text-sm">You joined Recipiece on {joinDate}.</p>
      </LoadingGroup>
      <hr />
      <VerifyAccountSection />
      <AccountManagementSection />
    </Stack>
  );
};
