import { createReadStream, mkdirSync, readdirSync, readFileSync, rmSync } from "fs";
import { DateTime } from "luxon";
import { isMainThread, parentPort, workerData } from "worker_threads";
import { gunzipSync } from "zlib";
import { prisma } from "../database";
import { RecipeIngredientSchema } from "../schema";
import { RecipeImportFiles } from "../util/constant";
import unzipper from "unzipper";

const paprikaImporter = async (jobId: string, fileName: string, userId: number) => {
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
      const splitIngredients = (<string>item.ingredients || "")
        .split("\\n")
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

      const parsedIngredients = (await response.json()) as { readonly ingredients: RecipeIngredientSchema[] };

      // the steps also have the same problem of being newlined
      const splitSteps: string[] = (item.directions || "").split("\\n");
      const steps = splitSteps.map((rawStep, idx) => {
        return {
          content: rawStep,
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
          description: item.description ?? "",
          created_at: createdAt.toJSDate(),
          steps: {
            createMany: {
              data: [...steps],
            },
          },
          ingredients: {
            createMany: {
              data: [...parsedIngredients.ingredients],
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

  // clear the files out

  // update the job
  await prisma.backgroundJob.update({
    where: {
      id: jobId,
    },
    data: {
      finished_at: DateTime.utc().toJSDate(),
      result: "succeeded",
    },
  });
};

const importerMap: { [key: string]: any } = {
  paprikarecipes: paprikaImporter,
};

export const runner = async (backgroundJobId: string) => {
  // pull the first job we find
  const job = await prisma.backgroundJob.findFirstOrThrow({
    where: {
      id: backgroundJobId,
      finished_at: null,
      purpose: RecipeImportFiles.IMPORT_TOPIC,
    },
  });

  const { file_name, user_id } = job.args as { readonly file_name: string; readonly user_id: number };
  const fileSplit = file_name.split(".");
  const extension = fileSplit[fileSplit.length - 1];
  const importer = importerMap[extension];

  if (importer) {
    await importer(backgroundJobId, file_name, user_id);
  } else {
    console.warn(`unknown file extension ${extension}, refusing to parse file, and removing it.`);

    // delete the file
    rmSync(file_name);

    // update the job
    await prisma.backgroundJob.update({
      where: {
        id: backgroundJobId,
      },
      data: {
        finished_at: DateTime.utc().toJSDate(),
        result: "failed",
      },
    });
  }
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
