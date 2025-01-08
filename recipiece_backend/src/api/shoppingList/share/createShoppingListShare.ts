import { StatusCodes } from "http-status-codes";
import { prisma } from "../../../database";
import { CreateShoppingListShareRequestSchema, ShoppingListShareSchema } from "../../../schema";
import { ApiResponse, AuthenticatedRequest } from "../../../types";

/**
 * Allow a user to share a shopping list they own with another user.
 */
export const createShoppingListShare = async (
  request: AuthenticatedRequest<CreateShoppingListShareRequestSchema>
): ApiResponse<ShoppingListShareSchema> => {
  const { shopping_list_id, user_kitchen_membership_id } = request.body;
  const user = request.user;

  const membership = await prisma.userKitchenMembership.findUnique({
    where: {
      id: user_kitchen_membership_id,
      source_user_id: user.id,
      status: "accepted",
    },
  });

  if (!membership) {
    return [
      StatusCodes.NOT_FOUND,
      {
        message: `User kitchen membership ${user_kitchen_membership_id} not found`,
      },
    ];
  }

  const shoppingList = await prisma.shoppingList.findUnique({
    where: {
      id: shopping_list_id,
      user_id: user.id,
    },
  });

  if (!shoppingList) {
    return [
      StatusCodes.NOT_FOUND,
      {
        message: `Shopping List ${shopping_list_id} not found`,
      },
    ];
  }

  try {
    const share = await prisma.shoppingListShare.create({
      data: {
        shopping_list_id: shoppingList.id,
        user_kitchen_membership_id: user_kitchen_membership_id,
      },
      include: {
        shopping_list: true,
      },
    });
    return [StatusCodes.OK, share];
  } catch (err) {
    if ((err as { code: string })?.code === "P2002") {
      return [
        StatusCodes.CONFLICT,
        {
          message: "Shopping list has already been shared",
        },
      ];
    } else {
      console.error(err);
      return [
        StatusCodes.INTERNAL_SERVER_ERROR,
        {
          message: "Unable to create shopping list",
        },
      ];
    }
  }
};
