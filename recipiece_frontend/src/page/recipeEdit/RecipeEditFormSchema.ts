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
});

export type RecipeEditFormData = z.infer<typeof RecipeEditFormSchema>;
