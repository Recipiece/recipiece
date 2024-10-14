import { FC } from "react";
import { Button } from "../../shadcn";
import { CirclePlus, CircleUserRound } from "lucide-react";

export const RecipieceFooter: FC = () => {
  return (
    <footer className="visible sm:invisible fixed bottom-0 left-0 h-12 bg-primary text-white">
      <div className="h-full flex flex-row justify-center items-center">
        <Button variant="link" className="text-white grow">
          <CirclePlus />
        </Button>

        <Button variant="link" className="text-white grow">
          <CircleUserRound />
        </Button>
      </div>
    </footer>
  );
};
