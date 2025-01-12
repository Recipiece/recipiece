import { Request } from "express";
import multer from "multer";
import { RecipeImportFiles } from "../util/constant";
import { DateTime } from "luxon";
import fs from "fs";
import { AuthenticatedRequest } from "../types";

const tmpRecipeImportStorage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    let dest = RecipeImportFiles.TMP_DIR;

    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest);

      const user = (req as AuthenticatedRequest).user;
      if(user) {
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
