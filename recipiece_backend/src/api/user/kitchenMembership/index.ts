import {
  YCreateUserKitchenMembershipRequestSchema,
  YListUserKitchenMembershipsQuerySchema,
  YListUserKitchenMembershipsResponseSchema,
  YSetUserKitchenMembershipStatusRequestSchema,
  YSetUserKitchenMembershipStatusResponseSchema,
  YUserKitchenMembershipSchema,
} from "../../../schema";
import { Route } from "../../../types";
import { createUserKitchenMembership } from "./createUserKitchenMembership";
import { deleteUserKitchenMembership } from "./deleteUserKitchenMembership";
import { getUserKitchenMembership } from "./getUserKitchenMembership";
import { listUserKitchenMemberships } from "./listUserKitchenMemberships";
import { setUserKitchenMembershipStatus } from "./setUserKitchenMembershipStatus";

export const USER_KITCHEN_MEMBERSHIP_ROUTES: Route[] = [
  {
    path: "/user/kitchen/membership",
    method: "POST",
    function: createUserKitchenMembership,
    requestSchema: YCreateUserKitchenMembershipRequestSchema,
    responseSchema: YUserKitchenMembershipSchema,
    authentication: "access_token",
  },
  {
    path: "/user/kitchen/membership",
    method: "PUT",
    function: setUserKitchenMembershipStatus,
    authentication: "access_token",
    requestSchema: YSetUserKitchenMembershipStatusRequestSchema,
    responseSchema: YSetUserKitchenMembershipStatusResponseSchema,
  },
  {
    path: "/user/kitchen/membership/:id(\\d+)",
    method: "DELETE",
    function: deleteUserKitchenMembership,
    authentication: "access_token",
  },
  {
    path: "/user/kitchen/membership/list",
    method: "GET",
    function: listUserKitchenMemberships,
    authentication: "access_token",
    requestSchema: YListUserKitchenMembershipsQuerySchema,
    responseSchema: YListUserKitchenMembershipsResponseSchema,
  },
  {
    path: "/user/kitchen/membership/:id(\\d+)",
    method: "GET",
    function: getUserKitchenMembership,
    authentication: "access_token",
    responseSchema: YUserKitchenMembershipSchema,
  },
];
