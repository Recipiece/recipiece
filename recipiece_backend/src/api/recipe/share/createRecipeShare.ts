import { StatusCodes } from "http-status-codes";
import { prisma } from "../../../database";
import { CreateRecipeShareRequestSchema, RecipeShareSchema } from "@recipiece/types";
import { ApiResponse, AuthenticatedRequest } from "../../../types";
import { sendRecipeSharedPushNotification } from "../../../util/pushNotification";

/**
 * Allow a user to share a recipe they own with another user.
 */
export const createRecipeShare = async (
  request: AuthenticatedRequest<CreateRecipeShareRequestSchema>
): ApiResponse<RecipeShareSchema> => {
  const { recipe_id, user_kitchen_membership_id } = request.body;
  const user = request.user;

  const membership = await prisma.userKitchenMembership.findUnique({
    where: {
      id: user_kitchen_membership_id,
      source_user_id: user.id,
      status: "accepted",
    },
    include: {
      source_user: true,
      destination_user: true,
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

  const recipe = await prisma.recipe.findUnique({
    where: {
      id: recipe_id,
      user_id: user.id,
    },
  });

  if (!recipe) {
    return [
      StatusCodes.NOT_FOUND,
      {
        message: `Recipe ${recipe_id} not found`,
      },
    ];
  }

  try {
    const share = await prisma.recipeShare.create({
      data: {
        recipe_id: recipe.id,
        user_kitchen_membership_id: user_kitchen_membership_id,
      },
      include: {
        recipe: true,
      },
    });

    const subscriptions = await prisma.userPushNotificationSubscription.findMany({
      where: {
        user_id: membership.destination_user_id,
      },
    });
    if (subscriptions) {
      subscriptions.forEach(async (sub) => {
        await sendRecipeSharedPushNotification(sub, membership.source_user, recipe);
      });
    }

    return [StatusCodes.OK, share];
  } catch (err) {
    if ((err as { code: string })?.code === "P2002") {
      return [
        StatusCodes.CONFLICT,
        {
          message: "Recipe has already been shared",
        },
      ];
    } else {
      console.error(err);
      return [
        StatusCodes.INTERNAL_SERVER_ERROR,
        {
          message: "Unable to create recipe",
        },
      ];
    }
  }
};
