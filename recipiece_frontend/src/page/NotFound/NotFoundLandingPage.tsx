import { FC, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TokenManager } from "../../api";

export const NotFoundLandingPage: FC = () => {
  const navigate = useNavigate();
  const tokenManager = TokenManager.getInstance();

  useEffect(() => {
    if (tokenManager.isLoggedIn) {
      navigate("/in-404");
    } else {
      navigate("/out-404");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenManager.isLoggedIn]);

  return <></>;
};
