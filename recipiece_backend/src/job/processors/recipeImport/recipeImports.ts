import { PutObjectCommand } from "@aws-sdk/client-s3";
import { Constant } from "@recipiece/constant";
import { prisma, RecipeIngredient } from "@recipiece/database";
import { YRecipeImportJobDataSchema } from "@recipiece/types";
import { Job } from "bullmq";
import { createReadStream, mkdirSync, readdirSync, readFileSync, rmSync } from "fs";
import { StatusCodes } from "http-status-codes";
import { DateTime } from "luxon";
import * as mime from "mime-types";
import unzipper from "unzipper";
import { gunzipSync } from "zlib";
import { RecipeImportFiles } from "../../../util/constant";
import { sendFinishedImportJobFailedEmail, sendFinishedImportJobSuccessEmail } from "../../../util/email";
import { Environment } from "../../../util/environment";
import { replaceUnicodeFractions } from "../../../util/fraction";
import { s3 } from "../../../util/s3";

const paprikaImporter = async (fileName: string, userId: number) => {
  const tmpSeed = DateTime.utc().toISO();
  mkdirSync(`${RecipeImportFiles.TMP_DIR}/${userId}/${tmpSeed}`, {
    recursive: true,
  });
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

      const url = `${Environment.RECIPE_PARSER_SERVICE_URL}/ingredients/parse`;
      let parsedIngredients = splitIngredients.map((ing) => {
        return {
          name: ing,
        };
      });
      try {
        const response = await fetch(url, {
          method: "POST",
          body: JSON.stringify({
            ingredients: splitIngredients,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (response.status !== StatusCodes.OK) {
          console.warn("could not parse ingredients at all! someone should check the recipe importer.");
          parsedIngredients = splitIngredients.map((ing) => {
            return {
              name: ing,
            };
          });
        } else {
          parsedIngredients = ((await response.json()) as { readonly ingredients: RecipeIngredient[] }).ingredients;
        }
      } catch (err) {
        console.error(err);
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

      let createdAt: DateTime;
      if (item.created?.strip?.()) {
        createdAt = DateTime.fromFormat(item.created.strip(), "yyyy-LL-dd HH-mm-ss", {
          zone: "utc",
        });
      } else {
        createdAt = DateTime.utc();
      }

      let createdRecipe = await prisma.recipe.create({
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

      // there was a photo, upload it to the bucket
      if (item.photo_data) {
        // try and suss out the file extension, or just blindly assume its a jpg
        let fileExtension = "jpg";
        if (item.image_url) {
          const extensionFromUrl = item.image_url.split(".").pop();
          if (Constant.RecipeImage.ALLOWED_EXTENSIONS.includes(extensionFromUrl)) {
            fileExtension = extensionFromUrl;
          }
        }

        const key = `${Constant.RecipeImage.keyFor(userId, createdRecipe.id)}.${fileExtension}`;
        const mimeType = mime.lookup(fileExtension) || (mime.lookup("jpg") as string);

        const putObjectCommand = new PutObjectCommand({
          Key: key,
          Bucket: Environment.S3_BUCKET,
          ContentType: mimeType,
          Body: Buffer.from(item.photo_data, "base64"),
        });
        try {
          await s3.send(putObjectCommand);
          const updatedRecipe = await prisma.recipe.update({
            where: { id: createdRecipe.id },
            data: {
              image_key: key,
            },
          });
          createdRecipe = {
            ...createdRecipe,
            ...updatedRecipe,
          };
        } catch (err) {
          console.log("failed to upload image");
          console.error(err);
        }
      }

      return createdRecipe;
    });

  //create the recipes
  await Promise.all(recipeCreateDataPromises);
};

const IMPORTER_MAP: { [key: string]: (fileName: string, userId: number) => Promise<void> } = {
  paprika: paprikaImporter,
};

export const importRecipes = async (job: Job) => {
  const sideJob = await prisma.sideJob.findFirst({
    where: {
      id: job.id!,
    },
  });
  if (!sideJob) {
    console.log(`job ${job.id} not found`);
    return;
  }

  const data = YRecipeImportJobDataSchema.cast(sideJob.job_data);

  const user = await prisma.user.findFirst({
    where: {
      id: sideJob.user_id,
    },
  });

  if (!user) {
    console.log(`user ${sideJob.user_id} not found`);
    return;
  }

  const innerRunner = async () => {
    try {
      const importer = IMPORTER_MAP[data.source];

      if (importer) {
        await importer(data.file_name, sideJob.user_id);
        return "success";
      } else {
        console.warn(`unknown file source ${data.source}, refusing to parse file, and removing it.`);
        rmSync(data.file_name);
        return "failure";
      }
    } catch (err) {
      console.error(err);
      return "failure";
    }
  };

  const result = (await innerRunner()) ?? "failed";

  const now = DateTime.utc();

  if (result === "success") {
    await sendFinishedImportJobSuccessEmail(user);
  } else {
    await sendFinishedImportJobFailedEmail(user);
  }

  console.log(`finished job id ${job.id} at ${now.toISO()} with status ${result}`);
};
