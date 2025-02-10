import { FC } from "react";
import { useGetSelfQuery } from "../../../api";
import { Divider, H2, LoadingGroup, Stack } from "../../../component";
import { ImportExportSection } from "./ImportExportSection";
import { KnownIngredientsSection } from "./KnownIngredientsSection";
import { TagsSection } from "./TagsSections";

export const DataTab: FC = () => {
  const { data: user, isLoading: isLoadingUser } = useGetSelfQuery();

  return (
    <Stack>
      <LoadingGroup isLoading={isLoadingUser} className="h-5 w-5">
        {user && (
          <>
            <H2>Data</H2>
            <TagsSection />
            <Divider />
            <ImportExportSection />
            <Divider />
            <KnownIngredientsSection />
          </>
        )}
      </LoadingGroup>
    </Stack>
  );
};
