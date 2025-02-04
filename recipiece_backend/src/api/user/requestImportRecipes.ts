import { prisma } from "@recipiece/database";
import { RecipeImportJobDataSchema, RequestImportRecipesRequestSchema } from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import { recipeImportQueue } from "../../job";
import { ApiResponse, AuthenticatedRequest } from "../../types";
import { JobType } from "../../util/constant";

/**
 * At this point, the file has already been placed in the correct place by the Multer middleware, so just
 * tell the worker where the file is and let it rip.
 */
export const requestImportRecipes = async (request: AuthenticatedRequest<RequestImportRecipesRequestSchema>): ApiResponse<{}> => {
  const user = request.user;

  try {
    await prisma.$transaction(async (tx) => {
      const job = await tx.sideJob.create({
        data: {
          user_id: user.id,
          type: JobType.RECIPE_IMPORT,
          job_data: <RecipeImportJobDataSchema>{
            file_name: request.file!.path,
            source: request.body.source,
          },
        },
      });

      await recipeImportQueue.add(job.id, {}, { jobId: job.id });
    });
  } catch (err) {
    console.error(err);
    return [
      StatusCodes.INTERNAL_SERVER_ERROR,
      {
        message: "Unable to import recipes",
      },
    ];
  }

  return [StatusCodes.OK, {}];
};
