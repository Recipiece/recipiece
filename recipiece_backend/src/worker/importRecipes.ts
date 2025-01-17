import { prisma, RecipeIngredient } from "@recipiece/database";
import { RecipeIngredientSchema } from "@recipiece/types";
import { createReadStream, mkdirSync, readdirSync, readFileSync, rmSync } from "fs";
import { StatusCodes } from "http-status-codes";
import { DateTime } from "luxon";
import unzipper from "unzipper";
import { isMainThread, parentPort, workerData } from "worker_threads";
import { gunzipSync } from "zlib";
import { RecipeImportFiles } from "../util/constant";
import { sendFinishedImportJobFailedEmail, sendFinishedImportJobSuccessEmail } from "../util/email";
import { replaceUnicodeFractions } from "../util/fraction";

const paprikaImporter = async (fileName: string, userId: number) => {
  const tmpSeed = DateTime.utc().toISO();
  mkdirSync(`${RecipeImportFiles.TMP_DIR}/${userId}/${tmpSeed}`);
  // .paprikarecipes files are zipped, so unzip the archive
  const unzipperPromise = new Promise<void>((resolve, reject) => {
    createReadStream(fileName)
      .pipe(
        unzipper.Extract({
          path: `${RecipeImportFiles.TMP_DIR}/${userId}/${tmpSeed}`,
        })
      )
      .on("close", () => {
        resolve();
      })
      .on("error", (err) => {
        reject(err);
      });
  });
  await unzipperPromise;

  // this will output a bunch of .paprikarecipe files that are also gzipped, so unzip all of those
  const filesIterator = readdirSync(`${RecipeImportFiles.TMP_DIR}/${userId}/${tmpSeed}`);
  const recipeCreateDataPromises = filesIterator
    .map((file) => {
      if (file.endsWith(".paprikarecipe")) {
        // each .paprikarecipe is really some blob of json. Decode the buffer and parse it out
        try {
          const paprikaRecipeData = readFileSync(`${RecipeImportFiles.TMP_DIR}/${userId}/${tmpSeed}/${file}`);
          const unzipped = gunzipSync(paprikaRecipeData);
          return JSON.parse(unzipped.toString("utf-8"));
        } catch (err) {
          console.error(err);
          return undefined;
        }
      }
    })
    .filter((item) => !!item)
    .map(async (item) => {
      // the ingredients come over with a newline present in them :/
      // we'll also have to run them through the NLP over in the recipe importer to parse them out
      // oh and also strip out any of those annoying vulgar fractions
      const splitIngredients = (<string>item.ingredients || "")
        .split("\n")
        .map((ing) => ing.trim())
        .filter((ing) => !!ing);

      const url = `${process.env.APP_RECIPE_PARSER_SERVICE_URL!}/ingredients/parse`;
      const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify({
          ingredients: splitIngredients,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      let parsedIngredients: Partial<RecipeIngredientSchema>[];
      if (response.status !== StatusCodes.OK) {
        console.warn("could not parse ingredients at all! someone should check the recipe importer.");
        parsedIngredients = splitIngredients.map((ing) => {
          return {
            name: ing,
          }
        });
      } else {
        parsedIngredients = ((await response.json()) as { readonly ingredients: RecipeIngredient[] }).ingredients;
      }
      parsedIngredients = parsedIngredients.map((ing, idx) => {
        return {
          ...ing,
          name: replaceUnicodeFractions(ing.name!),
          order: idx,
        };
      });

      // the steps also have the same problem of being newlined
      const splitSteps: string[] = (item.directions || "").split("\n");
      const steps = splitSteps
        .map((rawStep) => rawStep.trim())
        .filter((rawStep) => !!rawStep)
        .map((rawStep, idx) => {
        return {
          content: replaceUnicodeFractions(rawStep),
          order: idx,
        };
      });

      // strip the photo data out of the recipe, if it's there, since it's so big
      const { photo_data, photo_hash, photo_large, ...restMetadata } = item;

      // const createdAt = item.created ? DateTime.fromISO(item.created, {zone: "utc"}) : DateTime.utc();
      let createdAt: DateTime;
      if (item.created?.strip?.()) {
        createdAt = DateTime.fromFormat(item.created.strip(), "yyyy-LL-dd HH-mm-ss", {
          zone: "utc",
        });
      } else {
        createdAt = DateTime.utc();
      }

      return prisma.recipe.create({
        data: {
          user_id: userId,
          name: item.name ?? `Paprika Import ${DateTime.utc().toISO()}`,
          description: (item.description ?? "").trim(),
          created_at: createdAt.toJSDate(),
          steps: {
            createMany: {
              data: [...steps],
            },
          },
          ingredients: {
            createMany: {
              data: [...(parsedIngredients as RecipeIngredient[])],
            },
          },
          metadata: {
            paprika: {
              ...restMetadata,
            },
          },
        },
      });
    });

  //create the recipes
  await Promise.all(recipeCreateDataPromises);
};

const IMPORTER_MAP: { [key: string]: (fileName: string, userId: number) => Promise<void> } = {
  paprika: paprikaImporter,
};

export const runner = async (backgroundJobId: string) => {
  // pull the first job we find along with the user
  const job = await prisma.backgroundJob.findFirstOrThrow({
    where: {
      id: backgroundJobId,
      finished_at: null,
      purpose: RecipeImportFiles.IMPORT_TOPIC,
    },
    include: {
      user: true,
    }
  });

  const innerRunner = async () => {
    try {
      const { file_name, user_id, source } = job.args as { readonly file_name: string; readonly user_id: number, readonly source: string };
      const importer = IMPORTER_MAP[source];

      if (importer) {
        await importer(file_name, user_id);
        return "success";
      } else {
        console.warn(`unknown file source ${source}, refusing to parse file, and removing it.`);
        rmSync(file_name);
        return "failure";
      }
    } catch (err) {
      console.error(err);
      return "failure";
    }
  };

  const result = (await innerRunner()) ?? "failed";

  const now = DateTime.utc();
  await prisma.backgroundJob.update({
    where: {
      id: backgroundJobId,
    },
    data: {
      finished_at: now.toJSDate(),
      result: result,
    },
  });

  if(result === "success") {
    await sendFinishedImportJobSuccessEmail(job.user, backgroundJobId);
  } else {
    await sendFinishedImportJobFailedEmail(job.user, backgroundJobId);
  }

  console.log(`finished job id ${backgroundJobId} at ${now.toISO()} with status ${result}`);
};

if (!isMainThread) {
  runner(workerData.background_job_id)
    .catch((err) => {
      console.error(err);
    })
    .finally(() => {
      parentPort?.postMessage("done");
    });
}
