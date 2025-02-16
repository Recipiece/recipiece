import { StatusCodes } from "http-status-codes";
import { PrismaTransaction } from "@recipiece/database";
import { ChangePasswordRequestSchema } from "@recipiece/types";
import { ApiResponse, AuthenticatedRequest } from "../../types";
import { hashPassword } from "../../util/password";

/**
 * Change the users password. This is authenticated through basic auth, so if they were able to get here
 * then we know who they are already.
 */
export const changePassword = async (request: AuthenticatedRequest<ChangePasswordRequestSchema>, tx: PrismaTransaction): ApiResponse<{}> => {
  const user = request.user;
  const { new_password } = request.body;

  const hashedPassword = await hashPassword(new_password);
  if (!hashedPassword) {
    return [
      StatusCodes.INTERNAL_SERVER_ERROR,
      {
        message: "Unable to change password",
      },
    ];
  }

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

  return [StatusCodes.OK, {}];
};
