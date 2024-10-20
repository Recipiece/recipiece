import { DateTime } from "luxon";
import { FC, useMemo } from "react";
import { useGetSelfQuery } from "../../api";
import { LoadingGroup } from "../../component";

export const AccountViewPage: FC = () => {
  const { data: account, isLoading: isLoadingAccount } = useGetSelfQuery();

  const joinDate = useMemo(() => {
    if (account) {
      return DateTime.fromISO(account.created_at).toFormat("dd MMMM, y");
    }
    return undefined;
  }, [account]);

  return (
    <div className="p-4 grid gap-4">
      <LoadingGroup isLoading={isLoadingAccount} className="w-full h-10">
        <h1 className="text-2xl">Welcome Back, {account?.email}</h1>
      </LoadingGroup>
      <LoadingGroup isLoading={isLoadingAccount}>
        <p>You joined Recipiece on {joinDate}</p>.
      </LoadingGroup>
    </div>
  );
};
