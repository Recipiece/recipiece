import { StatusCodes } from "http-status-codes";
import { prisma } from "../../database";
import { ChangePasswordRequestSchema } from "../../schema";
import { ApiResponse, AuthenticatedRequest } from "../../types";
import { hashPassword } from "../../util/password";

/**
 * Change the users password. This is authenticated through basic auth, so if they were able to get here
 * then we know who they are already.
 */
export const changePassword = async (request: AuthenticatedRequest<ChangePasswordRequestSchema>): ApiResponse<{}> => {
  const user = request.user;
  const { new_password } = request.body;

  try {
    const hashedPassword = await hashPassword(new_password);
    if (!hashedPassword) {
      return [
        StatusCodes.INTERNAL_SERVER_ERROR,
        {
          message: "Unable to change password",
        },
      ];
    }

    await prisma.$transaction(async (tx) => {
      // update the users credentials
      await tx.userCredentials.update({
        where: {
          user_id: user.id,
        },
        data: {
          password_hash: hashedPassword,
        },
      });

      // delete any existing sessions
      await tx.userSession.deleteMany({
        where: {
          user_id: user.id,
        },
      });
    });

    return [StatusCodes.OK, {}];
  } catch(err) {
    console.error(err);
    
    return [
      StatusCodes.INTERNAL_SERVER_ERROR,
      {
        message: "Unable to create account",
      },
    ];
  }
};
