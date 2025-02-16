import { StatusCodes } from "http-status-codes";
import { PrismaTransaction } from "@recipiece/database";
import { CreateRecipeShareRequestSchema, RecipeShareSchema } from "@recipiece/types";
import { ApiResponse, AuthenticatedRequest } from "../../../types";
import { sendRecipeSharedPushNotification } from "../../../util/pushNotification";
import { ConflictError } from "../../../util/error";

/**
 * Allow a user to share a recipe they own with another user.
 */
export const createRecipeShare = async (request: AuthenticatedRequest<CreateRecipeShareRequestSchema>, tx: PrismaTransaction): ApiResponse<RecipeShareSchema> => {
  const { recipe_id, user_kitchen_membership_id } = request.body;
  const user = request.user;

  const membership = await tx.userKitchenMembership.findUnique({
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

  const recipe = await tx.recipe.findUnique({
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
    const share = await tx.recipeShare.create({
      data: {
        recipe_id: recipe.id,
        user_kitchen_membership_id: user_kitchen_membership_id,
      },
      include: {
        recipe: true,
      },
    });

    const subscriptions = await tx.userPushNotificationSubscription.findMany({
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
      throw new ConflictError("Recipe has already been shared");
    }
    throw err;
  }
};
