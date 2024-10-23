import { FC } from "react";
import { Button } from "../../shadcn";
import { CirclePlus, CircleUserRound, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const RecipieceFooter: FC = () => {
  const navigate = useNavigate();

  return (
    <footer className="visible sm:invisible w-full fixed bottom-0 left-0 h-12 bg-primary text-white">
      <div className="h-full flex flex-row justify-center items-center">
        <Button onClick={() => navigate("/")} variant="link" className="text-white grow">
          <Home />
        </Button>

        <Button onClick={() => navigate("/recipe/edit/new")} variant="link" className="text-white grow">
          <CirclePlus />
        </Button>

        <Button onClick={() => navigate("/account")} variant="link" className="text-white grow">
          <CircleUserRound />
        </Button>
      </div>
    </footer>
  );
};
