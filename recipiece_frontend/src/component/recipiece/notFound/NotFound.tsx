import { FC } from "react";
import {ReactComponent as Oven } from "./Oven.svg";
import {ReactComponent as QuestionMark } from "./QuestionMark.svg";

export interface NotFoundProps {
  readonly message?: string;
}

export const NotFound: FC<NotFoundProps> = ({ message }) => {
  return <></>;
}