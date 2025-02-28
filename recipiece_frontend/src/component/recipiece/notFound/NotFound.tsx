import { FC, ReactNode, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../shadcn";
import { DataTestId } from "@recipiece/constant";

export interface NotFoundProps {
  readonly message?: ReactNode;
  readonly backNav?: string;
  readonly dataTestId?: string;
}

const messages = ["Nothing in the oven here", "Nothing cooking in this kitchen", "Time to make a grocery run"];

export const NotFound: FC<NotFoundProps> = ({ message, backNav, dataTestId }) => {
  const navigate = useNavigate();

  const messageToDisplay = useMemo(() => {
    return message ?? messages[Math.floor(Math.random() * (messages.length - 1))];
  }, [message]);

  return (
    <div className="flex flex-col flex-wrap items-center justify-center">
      {/* <QuestionMark title="Not Found Question Mark" className="stroke-primary w-[100px] h-[100px] mb-2" />
      <Oven title="Not Found Oven" className="fill-primary w-[128px] h-[128px] mb-2" /> */}
      <p className="mb-2 text-lg" data-testid={DataTestId.NotFound.PARAGRAPH_MESSAGE(dataTestId)}>
        {messageToDisplay}
      </p>
      {backNav && (
        <Button data-testid={DataTestId.NotFound.BUTTON_GO_BACK(dataTestId)} onClick={() => navigate(backNav)} type="button" variant="link">
          Go Back
        </Button>
      )}
    </div>
  );
};
