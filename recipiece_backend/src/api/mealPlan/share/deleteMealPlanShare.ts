import { prisma } from "@recipiece/database";
import { StatusCodes } from "http-status-codes";
import { ApiResponse, AuthenticatedRequest } from "../../../types";

export const deleteMealPlanShare = async (request: AuthenticatedRequest): ApiResponse<{}> => {
  const shareId = +request.params.id;

  const share = await prisma.mealPlanShare.findFirst({
    where: {
      id: shareId,
      user_kitchen_membership: {
        source_user_id: request.user.id,
      },
      meal_plan: {
        user_id: request.user.id,
      },
    },
  });

  if (!share) {
    return [
      StatusCodes.NOT_FOUND,
      {
        message: `Meal plan share ${shareId} not found`,
      },
    ];
  }

  try {
    await prisma.mealPlanShare.delete({
      where: {
        id: share.id,
      },
    });
    return [StatusCodes.OK, {}];
  } catch (err) {
    console.error(err);
    return [
      StatusCodes.INTERNAL_SERVER_ERROR,
      {
        message: "Internal server error",
      },
    ];
  }
};
