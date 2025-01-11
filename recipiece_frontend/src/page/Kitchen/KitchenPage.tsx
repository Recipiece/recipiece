import { FC } from "react";
import { H2, Stack } from "../../component";
import { FromUserTable } from "./FromUserTable";
import { TargetingUserTable } from "./TargetingUserTable";
import { PastTargetingMembershipsTable } from "./PastTargetingMembershipsTable";

export const KitchenPage: FC = () => {
  return (
    <Stack>
      <H2>Your Kitchen</H2>
      <TargetingUserTable />
      <hr />
      <FromUserTable />
      <hr />
      <PastTargetingMembershipsTable />
    </Stack>
  );
};
