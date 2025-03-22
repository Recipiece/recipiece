import { YListUserTagsQuerySchema, YListUserTagsResponseSchema } from "@recipiece/types";
import { Route } from "../../types";
import { deleteUserTag } from "./deleteUserTag";
import { listUserTags } from "./listUserTags";

export const USER_TAG_ROUTES: Route[] = [
  {
    path: "/user-tag/list",
    method: "GET",
    function: listUserTags,
    authentication: "access_token",
    requestSchema: YListUserTagsQuerySchema,
    responseSchema: YListUserTagsResponseSchema,
  },
  {
    path: "/user-tag/:id",
    method: "DELETE",
    function: deleteUserTag,
    authentication: "access_token",
  },
];
