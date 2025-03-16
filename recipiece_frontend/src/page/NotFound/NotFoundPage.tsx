import { FC } from "react";
import { NotFound } from "../../component";

export const NotFoundPage: FC = () => {
  return (
    <div>
      <NotFound backNav="/dashboard" message="This pantry is looking pretty empty." />
    </div>
  );
};
