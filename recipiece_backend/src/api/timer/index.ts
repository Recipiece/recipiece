import {
  YCreateTimerRequestSchema,
  YListTimersQuerySchema,
  YListTimersResponseSchema,
  YTimerSchema,
  YUpdateTimerRequestSchema,
} from "../../schema";
import { Route } from "../../types";
import { Versions } from "../../util/constant";
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
    version: Versions.ALL,
    requestSchema: YCreateTimerRequestSchema,
    responseSchema: YTimerSchema,
  },
  {
    path: "/timer/:id(\\d+)",
    function: deleteTimer,
    authentication: "access_token",
    method: "DELETE",
    version: Versions.ALL,
  },
  {
    path: "/timer/:id(\\d+)",
    function: getTimer,
    authentication: "access_token",
    method: "GET",
    version: Versions.ALL,
  },
  {
    path: "/timer/list",
    authentication: "access_token",
    method: "GET",
    function: listTimers,
    requestSchema: YListTimersQuerySchema,
    responseSchema: YListTimersResponseSchema,
    version: Versions.ALL,
  },
  {
    path: "/timer",
    authentication: "access_token",
    method: "PUT",
    function: updateTimer,
    requestSchema: YUpdateTimerRequestSchema,
    responseSchema: YTimerSchema,
    version: Versions.ALL,
  },
];
