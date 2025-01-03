import { FC } from "react";
import { useParams } from "react-router-dom";

export const KitchenMembershipPage: FC = () => {
  const { kitchenMembershipId } = useParams();
  const entityId = +kitchenMembershipId!;

  return <></>;
}