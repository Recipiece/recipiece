import { zodResolver } from "@hookform/resolvers/zod";
import { CreateRecipeRequestSchema, RecipeIngredientSchema, RecipeSchema, RecipeStepSchema, UpdateRecipeRequestSchema } from "@recipiece/types";
import { FC, useContext, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useCreateRecipeMutation, useGetRecipeByIdQuery, useGetSelfQuery, useParseRecipeFromURLMutation, useUpdateRecipeMutation } from "../../api";
import { Button, Divider, Form, FormInput, FormTextarea, NotFound, Stack, SubmitButton, useToast } from "../../component";
import { DialogContext } from "../../context";
import { ParseRecipeFromURLForm } from "../../dialog";
import { formatIngredientAmount } from "../../util";
import { IngredientsForm } from "./IngredientsForm";
import { RecipeEditFormData, RecipeEditFormSchema } from "./RecipeEditFormSchema";
import { StepsForm } from "./StepsForm";
import { TagsForm } from "./TagsForm";
import { DataTestId } from "@recipiece/constant";

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

  const onSubmit = async (formData: RecipeEditFormData) => {
    const sanitizedFormData: CreateRecipeRequestSchema | UpdateRecipeRequestSchema = {
      id: isCreatingNewRecipe ? undefined : recipeId,
      name: formData.name,
      description: formData.description,
      servings: formData.servings,
      ingredients: formData.ingredients.map((ing, index) => {
        return {
          ...ing,
          order: index,
        };
      }) as RecipeIngredientSchema[],
      steps: formData.steps.map((step, index) => {
        return {
          ...step,
          order: index,
        };
      }) as RecipeStepSchema[],
      tags: (formData.tags ?? []).map((t) => t.content),
    };

    try {
      let response: RecipeSchema;
      if (isCreatingNewRecipe) {
        response = await createRecipe(sanitizedFormData as CreateRecipeRequestSchema);
      } else {
        response = await updateRecipe(sanitizedFormData as UpdateRecipeRequestSchema);
      }
      navigate(`/recipe/view/${response.id}`);
    } catch {
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

  const defaultFormValues = useMemo((): RecipeEditFormData => {
    if (recipe) {
      return {
        name: recipe.name,
        description: recipe.description ?? "",
        steps: recipe.steps ?? [],
        ingredients: (recipe.ingredients ?? []).map((ing) => {
          return {
            ...ing,
            amount: ing.amount ? formatIngredientAmount(ing.amount) : undefined,
            unit: ing.unit === null ? undefined : ing.unit,
          };
        }),
        servings: recipe.servings ?? undefined,
        tags: (recipe.tags ?? []).map((t) => {
          return {
            content: t.content,
          };
        }),
        currentTag: "",
      };
    } else {
      return {
        name: "",
        description: "",
        servings: 1,
        steps: [],
        ingredients: [],
        currentTag: "",
        tags: [],
      };
    }
  }, [recipe]);

  const form = useForm<RecipeEditFormData>({
    resolver: zodResolver(RecipeEditFormSchema),
    defaultValues: defaultFormValues,
  });

  useEffect(() => {
    form.reset({ ...defaultFormValues });
  }, [form, defaultFormValues]);

  const recipeDescription = form.watch("description");

  const onParseRecipeDialogSubmit = async (data: ParseRecipeFromURLForm) => {
    try {
      const response = await parseRecipe(data.url);
      form.reset({ ...response, currentTag: "", tags: [] } as RecipeEditFormData);
      popDialog("parseRecipeFromURL");
      toast({
        title: "Recipe Parsed",
        description: "This recipe was successfully imported.",
      });
    } catch (err) {
      console.error(err);
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
            <FormInput data-testid={DataTestId.RecipeEditPage.INPUT_NAME} name="name" label="Recipe Name" placeholder="What do you want to call this recipe?" />
            <FormInput
              data-testid={DataTestId.RecipeEditPage.INPUT_SERVINGS}
              min={1}
              step={1}
              name="servings"
              type="number"
              label="Servings"
              placeholder="How many servings does this recipe make?"
            />
            <TagsForm />
            <FormTextarea
              data-testid={DataTestId.RecipeEditPage.TEXTAREA_DESCRIPTION}
              maxLength={1000}
              name="description"
              placeholder="What is this recipe all about?"
              label="Description"
              instructions={<>{(recipeDescription || "").length} / 1000</>}
            />

            {(isCreatingNewRecipe || !!recipe) && (
              <div className="grid grid-cols-1 gap-4">
                <Divider />
                <IngredientsForm isLoading={isLoading} />
                <Divider />
                <StepsForm isLoading={isLoading} />
              </div>
            )}

            {(isCreatingNewRecipe || !!recipe) && (
              <div className="mt-2 flex flex-row justify-end">
                <Button
                  data-testid={DataTestId.RecipeEditPage.BUTTON_CANCEL}
                  disabled={form?.formState?.isSubmitting}
                  onClick={() => navigate("/")}
                  variant="secondary"
                  type="button"
                  className="mr-2"
                >
                  Cancel
                </Button>
                <SubmitButton data-testid={DataTestId.RecipeEditPage.BUTTON_SAVE}>Save</SubmitButton>
              </div>
            )}
          </Stack>
        </form>
      </Form>

      {isRecipeGetError && <NotFound dataTestId={DataTestId.RecipeEditPage.NOT_FOUND} backNav="/" />}
    </div>
  );
};
