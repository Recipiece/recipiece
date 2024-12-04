import { StatusCodes } from "http-status-codes";
import { prisma } from "../../database";
import { RequestImportRecipesRequestSchema } from "../../schema";
import { ApiResponse, AuthenticatedRequest } from "../../types";
import { RecipeImportFiles } from "../../util/constant";
import { generateRecipeImportWorker } from "../../worker";

/**
 * Creates a background_jobs record and kicks off a worker to actually perform the file import
 *
 * At this point, the file has already been placed in the correct place by the Multer middleware, so just
 * tell the worker where the file is and let it rip.
 */
export const requestImportRecipes = async (
  request: AuthenticatedRequest<RequestImportRecipesRequestSchema>
): ApiResponse<{}> => {
  const user = request.user;

  const existingBackgroundJobs = await prisma.backgroundJob.findFirst({
    where: {
      user_id: user.id,
      purpose: RecipeImportFiles.IMPORT_TOPIC,
      finished_at: null,
    },
  });

  if (existingBackgroundJobs) {
    return [
      StatusCodes.TOO_MANY_REQUESTS,
      {
        message: "Only one import is allowed at a time",
      },
    ];
  }

  const workerData = {
    file_name: `${RecipeImportFiles.TMP_DIR}/${user.id}/${request.file?.filename}`,
    user_id: user.id,
  };

  const backgroundJob = await prisma.backgroundJob.create({
    data: {
      user_id: user.id,
      purpose: RecipeImportFiles.IMPORT_TOPIC,
      args: { ...workerData },
    },
  });

  const recipeImportWorker = generateRecipeImportWorker();
  recipeImportWorker.postMessage({
    background_job_id: backgroundJob.id,
  });

  return [StatusCodes.OK, {}];
};
