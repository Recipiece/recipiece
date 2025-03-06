import { FC } from "react";
import { useGetSelfQuery } from "../../../api";
import { H2, H3, LoadingGroup, Stack } from "../../../component";
import { NotificationsSection } from "./NotificationsSection";
import { PrivacySection } from "./PrivacySection";
import { ThemeSection } from "./ThemeSection";

export const PreferencesTab: FC = () => {
  const { data: user, isLoading: isLoadingUser } = useGetSelfQuery();

  return (
    <LoadingGroup isLoading={isLoadingUser} className="h-5 w-5">
      <Stack>
        {user && <H2>Preferences</H2>}
        <p>Manage your account preferences</p>
        <NotificationsSection />
        <ThemeSection />
        <PrivacySection user={user} isLoading={isLoadingUser} />
      </Stack>
    </LoadingGroup>
  );
};
