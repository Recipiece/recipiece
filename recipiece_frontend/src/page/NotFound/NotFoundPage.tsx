import { DataTestId } from "@recipiece/constant";
import { FC } from "react";
import { TokenManager } from "../../api";
import { NotFound } from "../../component";

export const NotFoundPage: FC = () => {
  const isLoggedIn = TokenManager.getInstance().isLoggedIn;

  return (
    <div>
      <NotFound
        dataTestId={DataTestId.NotFoundPage.NOT_FOUND}
        message="Nothing cooking in this kitchen!"
        backNav={isLoggedIn ? "/dashboard" : "/login"}
      />
    </div>
  );
};
