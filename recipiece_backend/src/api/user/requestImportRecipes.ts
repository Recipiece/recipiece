import { RequestImportRecipesRequestSchema } from "@recipiece/types";
import { StatusCodes } from "http-status-codes";
import { recipeImportQueue } from "../../job";
import { ApiResponse, AuthenticatedRequest } from "../../types";

/**
 * Creates a background_jobs record and kicks off a worker to actually perform the file import
 *
 * At this point, the file has already been placed in the correct place by the Multer middleware, so just
 * tell the worker where the file is and let it rip.
 */
export const requestImportRecipes = async (request: AuthenticatedRequest<RequestImportRecipesRequestSchema>): ApiResponse<{}> => {
  const user = request.user;

  // const existingBackgroundJobs = await prisma.backgroundJob.findFirst({
  //   where: {
  //     user_id: user.id,
  //     purpose: RecipeImportFiles.IMPORT_TOPIC,
  //     finished_at: null,
  //   },
  // });

  // if (existingBackgroundJobs) {
  //   return [
  //     StatusCodes.TOO_MANY_REQUESTS,
  //     {
  //       message: "Only one import is allowed at a time",
  //     },
  //   ];
  // }

  const workerData = {
    file_name: request.file!.path,
    user_id: user.id,
    source: request.body.source,
  };

  const jobId = `recipeImport:${user.id}:${request.file!.path}`;
  await recipeImportQueue.add(jobId, workerData, {
    removeOnComplete: true,
    removeOnFail: true,
    jobId: jobId,
  });

  return [StatusCodes.OK, {}];
};
