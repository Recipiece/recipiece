import { FC } from "react";
import { useGetSelfQuery } from "../../../api";
import { Divider, H2, LoadingGroup, Stack } from "../../../component";
import { ChangePasswordSection } from "./ChangePasswordSection";
import { ChangeUsernameSection } from "./ChangeUsernameSection";
import { DeleteAccountSection } from "./DeleteAccountSection";
import { VerifyAccountSection } from "./VerifyAccountSection";

export const AccountTab: FC = () => {
  const { data: user, isLoading: isLoadingUser } = useGetSelfQuery();

  return (
    <Stack>
      <LoadingGroup isLoading={isLoadingUser} className="w-5 h-5">
        {user && (
          <>
            <H2>Your Account</H2>
            <VerifyAccountSection />
            <Divider />
            <ChangeUsernameSection />
            <Divider />
            <ChangePasswordSection />
            <Divider />
            <DeleteAccountSection />
          </>
        )}
      </LoadingGroup>
    </Stack>
  );
};
