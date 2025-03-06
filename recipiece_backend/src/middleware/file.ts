import fs from "fs";
import { Request } from "express";
import { DateTime } from "luxon";
import multer from "multer";
import { AuthenticatedRequest } from "../types";
import { RecipeImportFiles } from "../util/constant";

const tmpRecipeImportStorage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    let dest = RecipeImportFiles.TMP_DIR;

    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest);

      const user = (req as AuthenticatedRequest).user;
      if (user) {
        dest = `${RecipeImportFiles.TMP_DIR}/${user.id}`;
        fs.mkdirSync(dest);
      }
    }
    cb(null, dest);
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    const seed = DateTime.utc().toMillis();
    const fileName = `${seed}_${file.originalname}`;
    cb(null, fileName);
  },
});

export const recipeImportUploader = multer({ storage: tmpRecipeImportStorage });
