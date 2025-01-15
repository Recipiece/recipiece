import { zodResolver } from "@hookform/resolvers/zod";
import { FC, useContext, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { useCreateRecipeMutation, useGetRecipeByIdQuery, useGetSelfQuery, useParseRecipeFromURLMutation, useUpdateRecipeMutation } from "../../api";
import { Button, Divider, Form, FormInput, FormTextarea, NotFound, Stack, SubmitButton, useToast } from "../../component";
import { DialogContext } from "../../context";
import { Recipe, RecipeIngredient, RecipeStep } from "../../data";
import { ParseRecipeFromURLForm } from "../../dialog";
import { IngredientsForm } from "./IngredientsForm";
import { StepsForm } from "./StepsForm";
import { formatIngredientAmount } from "../../util";

const RecipeFormSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().max(1000).optional(),
  servings: z.coerce.number().min(0).optional(),
  steps: z.array(
    z.object({
      content: z.string().min(3),
    })
  ),
  ingredients: z.array(
    z.object({
      name: z.string().min(1),
      unit: z.string().optional().nullable(),
      amount: z.string().optional().nullable(),
    })
  ),
});

type RecipeForm = z.infer<typeof RecipeFormSchema>;

export const RecipeEditPage: FC = () => {
  const { pushDialog, popDialog } = useContext(DialogContext);
  const { id: idFromParams } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();

  const [isRecipeGetError, setIsRecipeGetError] = useState(false);

  const isCreatingNewRecipe = useMemo(() => {
    return idFromParams === "new";
  }, [idFromParams]);

  const recipeId = useMemo(() => {
    return idFromParams === "new" ? undefined : +idFromParams!;
  }, [idFromParams]);

  const {
    data: recipe,
    isLoading: isLoadingRecipe,
    isError: isRecipeGetErrorFromRequest,
  } = useGetRecipeByIdQuery(recipeId as number, {
    enabled: !isCreatingNewRecipe,
  });

  const { data: currentUser, isLoading: isLoadingCurrentUser } = useGetSelfQuery();

  /**
   * Don't allow someone who does not own a recipe to edit it
   */
  useEffect(() => {
    if (currentUser && recipe) {
      if (currentUser.id !== recipe.user_id) {
        setIsRecipeGetError(true);
      }
    } else if (isRecipeGetErrorFromRequest) {
      setIsRecipeGetError(true);
    }
  }, [currentUser, recipe, isRecipeGetErrorFromRequest]);

  const { mutateAsync: createRecipe } = useCreateRecipeMutation();
  const { mutateAsync: updateRecipe } = useUpdateRecipeMutation();
  const { mutateAsync: parseRecipe } = useParseRecipeFromURLMutation();

  const onSubmit = async (formData: RecipeForm) => {
    const sanitizedFormData: Partial<Recipe> = {
      id: isCreatingNewRecipe ? undefined : recipeId,
      name: formData.name,
      description: formData.description,
      servings: formData.servings,
      ingredients: formData.ingredients.map((ing, index) => {
        return {
          ...ing,
          order: index,
        };
      }) as RecipeIngredient[],
      steps: formData.steps.map((step, index) => {
        return {
          ...step,
          order: index,
        };
      }) as RecipeStep[],
    };

    try {
      let response: Recipe;
      if (isCreatingNewRecipe) {
        response = await createRecipe(sanitizedFormData);
      } else {
        response = await updateRecipe(sanitizedFormData);
      }
      navigate(`/recipe/view/${response.id}`);
    } catch (err) {
      toast({
        title: "Unable to Save Recipe",
        description: "This recipe could not be saved. Please try again later.",
        variant: "destructive",
      });
    }
  };

  const isLoading = useMemo(() => {
    if (isCreatingNewRecipe) {
      return isLoadingCurrentUser;
    }
    return isLoadingRecipe || isLoadingCurrentUser;
  }, [isLoadingRecipe, isCreatingNewRecipe, isLoadingCurrentUser]);

  const defaultFormValues = useMemo((): RecipeForm => {
    if (recipe) {
      return {
        name: recipe.name,
        description: recipe.description,
        steps: recipe.steps,
        ingredients: (recipe.ingredients ?? []).map((ing) => {
          return {
            ...ing,
            amount: !!ing.amount ? formatIngredientAmount(ing.amount) : undefined,
            unit: ing.unit === null ? undefined : ing.unit,
          };
        }),
        servings: recipe.servings,
      };
    } else {
      return {
        name: "",
        description: "",
        servings: 1,
        steps: [],
        ingredients: [],
      };
    }
  }, [recipe]);

  const form = useForm<RecipeForm>({
    resolver: zodResolver(RecipeFormSchema),
    defaultValues: defaultFormValues,
  });

  useEffect(() => {
    form.reset({ ...defaultFormValues });
  }, [form, defaultFormValues]);

  const recipeDescription = form.watch("description");

  const onParseRecipeDialogSubmit = async (data: ParseRecipeFromURLForm) => {
    try {
      const response = await parseRecipe(data.url);
      form.reset({ ...response });
      popDialog("parseRecipeFromURL");
      toast({
        title: "Recipe Parsed",
        description: "This recipe was successfully imported.",
      });
    } catch {
      popDialog("parseRecipeFromURL");
      toast({
        title: "Recipe Parsing Failed",
        description: "This recipe could not be imported.",
        variant: "destructive",
      });
    }
  };

  /**
   * If we're hitting this page with a search param of source=url, open the url dialog
   */
  useEffect(() => {
    if (searchParams.get("source") === "url") {
      pushDialog("parseRecipeFromURL", {
        onSubmit: onParseRecipeDialogSubmit,
        onClose: () => popDialog("parseRecipeFromURL"),
      });
      setSearchParams((prev) => {
        prev.delete("source");
        return prev;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return (
    <div className="p-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Stack>
            <FormInput name="name" label="Recipe Name" placeholder="What do you want to call this recipe?" />
            <FormInput min={1} step={1} name="servings" type="number" label="Servings" placeholder="How many servings does this recipe make?" />
            <FormTextarea
              maxLength={1000}
              name="description"
              placeholder="What is this recipe all about?"
              label="Description"
              instructions={<>{(recipeDescription || "").length} / 1000</>}
            ></FormTextarea>

            {(isCreatingNewRecipe || !!recipe) && (
              <div className="grid gap-4 grid-cols-1">
                <Divider />
                <IngredientsForm isLoading={isLoading} />
                <Divider />
                <StepsForm isLoading={isLoading} />
              </div>
            )}

            {(isCreatingNewRecipe || !!recipe) && (
              <div className="flex flex-row justify-end mt-2">
                <Button disabled={form?.formState?.isSubmitting} onClick={() => navigate("/")} variant="secondary" type="button" className="mr-2">
                  Cancel
                </Button>
                <SubmitButton>Save</SubmitButton>
              </div>
            )}
          </Stack>
        </form>
      </Form>

      {isRecipeGetError && <NotFound backNav="/" />}
    </div>
  );
};
