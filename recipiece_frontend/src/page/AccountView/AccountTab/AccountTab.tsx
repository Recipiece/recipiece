import { FC } from "react";
import { useGetSelfQuery } from "../../../api";
import { LoadingGroup, Stack } from "../../../component";
import { VerifyAccountSection } from "./VerifyAccountSection";
import { ChangeUsernameSection } from "./ChangeUsernameSection";
import { ChangePasswordSection } from "./ChangePasswordSection";

export const AccountTab: FC = () => {
  const { data: user, isLoading: isLoadingUser } = useGetSelfQuery();

  return (
    <Stack>
      <LoadingGroup isLoading={isLoadingUser} className="w-5 h-5">
        {user && (
          <>
            <ChangeUsernameSection />
            <hr />
            <ChangePasswordSection />
            <hr />
            <VerifyAccountSection />
          </>
        )}
      </LoadingGroup>
    </Stack>
  );
};

