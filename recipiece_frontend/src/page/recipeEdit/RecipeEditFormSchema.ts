import { Constant } from "@recipiece/constant";
import { z } from "zod";

export const RecipeEditFormSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().max(1000).optional(),
  servings: z.coerce.number().min(0).optional(),
  steps: z
    .array(
      z.object({
        content: z.string().min(3),
      })
    )
    .default([]),
  ingredients: z
    .array(
      z.object({
        name: z.string().min(1),
        unit: z.string().optional().nullable(),
        amount: z.string().optional().nullable(),
      })
    )
    .default([]),
  tags: z
    .array(
      z.object({
        content: z.string(),
      })
    )
    .optional(),
  currentTag: z.string(),
  image: z
    .instanceof(FileList)
    .refine((fileData) => {
      if (fileData && fileData.item(0)) {
        return fileData.item(0)!.size <= Constant.RecipeImage.MAX_FILE_SIZE_BYTES;
      }
      return true;
    }, "File must be under 40 MB")
    .optional(),
  external_image_url: z.string().url().optional(),
  image_type: z.string().default("file"),
});

export type RecipeEditFormData = z.infer<typeof RecipeEditFormSchema>;
