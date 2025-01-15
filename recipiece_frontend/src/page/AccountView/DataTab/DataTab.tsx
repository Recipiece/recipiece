import { FC } from "react";
import { useGetSelfQuery } from "../../../api";
import { Divider, H2, LoadingGroup, Stack } from "../../../component";
import { ImportExportSection } from "./ImportExportSection";
import { KnownIngredientsSection } from "./KnownIngredientsSection";

export const DataTab: FC = () => {
  const { data: user, isLoading: isLoadingUser } = useGetSelfQuery();

  return (
    <Stack>
      <LoadingGroup isLoading={isLoadingUser} className="w-5 h-5">
        {user && (
          <>
            <H2>Data</H2>
            <ImportExportSection />
            <Divider />
            <KnownIngredientsSection />
          </>
        )}
      </LoadingGroup>
    </Stack>
  );
};
