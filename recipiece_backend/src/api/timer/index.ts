import { YCreateTimerRequestSchema, YListTimersQuerySchema, YListTimersResponseSchema, YTimerSchema, YUpdateTimerRequestSchema } from "@recipiece/types";
import { Route } from "../../types";
import { createTimer } from "./createTimer";
import { deleteTimer } from "./deleteTimer";
import { getTimer } from "./getTimer";
import { listTimers } from "./listTimers";
import { updateTimer } from "./updateTimer";

export const TIMER_ROUTES: Route[] = [
  {
    path: "/timer",
    function: createTimer,
    authentication: "access_token",
    method: "POST",

    requestSchema: YCreateTimerRequestSchema,
    responseSchema: YTimerSchema,
  },
  {
    path: "/timer/:id(\\d+)",
    function: deleteTimer,
    authentication: "access_token",
    method: "DELETE",
  },
  {
    path: "/timer/:id(\\d+)",
    function: getTimer,
    authentication: "access_token",
    method: "GET",
  },
  {
    path: "/timer/list",
    authentication: "access_token",
    method: "GET",
    function: listTimers,
    requestSchema: YListTimersQuerySchema,
    responseSchema: YListTimersResponseSchema,
  },
  {
    path: "/timer",
    authentication: "access_token",
    method: "PUT",
    function: updateTimer,
    requestSchema: YUpdateTimerRequestSchema,
    responseSchema: YTimerSchema,
  },
];
