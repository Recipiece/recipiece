import { zodResolver } from "@hookform/resolvers/zod";
import { FC, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { useCreateRecipeMutation, useGetRecipeByIdQuery, useGetSelfQuery, useParseRecipeFromURLMutation, useUpdateRecipeMutation } from "../../api";
import { Button, Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, Input, LoadingGroup, NotFound, Textarea, useToast } from "../../component";
import { IngredientsForm } from "./IngredientsForm";
import { StepsForm } from "./StepsForm";
import { Recipe, RecipeIngredient, RecipeStep } from "../../data";
import { ParseRecipeFromURLDialog, ParseRecipeFromURLForm } from "../../dialog";

const RecipeFormSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().min(3).max(1000),
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
  const { id: idFromParams } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();

  const [isRecipeGetError, setIsRecipeGetError] = useState(false);
  const [isParseFromUrlModalOpen, setIsParseFromUrlModalOpen] = useState(false);

  /**
   * If we're hitting this page with a search param of source=url, open the url dialog
   */
  useEffect(() => {
    if(searchParams.get("source") === "url") {
      setIsParseFromUrlModalOpen(true);
      setSearchParams((prev) => {
        prev.delete("source");
        return prev;
      })
    }
  }, [searchParams]);

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
    disabled: isCreatingNewRecipe,
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
        response = (await createRecipe(sanitizedFormData)).data;
      } else {
        response = (await updateRecipe(sanitizedFormData)).data;
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
        ingredients: recipe.ingredients,
      };
    } else {
      return {
        name: "",
        description: "",
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
      form.reset({ ...response.data });
      setIsParseFromUrlModalOpen(false);
      toast({
        title: "Recipe Parsed",
        description: "This recipe was successfully imported.",
      });
    } catch {
      setIsParseFromUrlModalOpen(false);
      toast({
        title: "Recipe Parsing Failed",
        description: "This recipe could not be imported.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-4">
      <ParseRecipeFromURLDialog isOpen={isParseFromUrlModalOpen} setIsOpen={setIsParseFromUrlModalOpen} onSubmit={onParseRecipeDialogSubmit} />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => {
              return (
                <FormItem className="mb-2">
                  {(isLoading || !isRecipeGetError) && <FormLabel>Recipe Name</FormLabel>}
                  <FormControl>
                    <LoadingGroup isLoading={isLoading} className="w-full h-10">
                      {<Input type="text" placeholder="Recipe Name" {...field} />}
                    </LoadingGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => {
              return (
                <FormItem className="mb-2">
                  {(isLoading || !isRecipeGetError) && <FormLabel>Description</FormLabel>}
                  <LoadingGroup isLoading={isLoading} className="w-full h-[138px]">
                    <FormControl>{<Textarea placeholder="A description of your recipe" rows={5} {...field} />}</FormControl>
                    {(isLoading || !isRecipeGetError) && <FormDescription>{recipeDescription?.length || 0} / 1000</FormDescription>}
                  </LoadingGroup>
                  <FormMessage />
                </FormItem>
              );
            }}
          />

          {(isCreatingNewRecipe || !!recipe) && (
            <div className="grid gap-4 grid-cols-1">
              <IngredientsForm isLoading={isLoading} />
              <hr />
              <StepsForm isLoading={isLoading} />
            </div>
          )}

          {(isCreatingNewRecipe || !!recipe) && (
            <div className="flex flex-row justify-end mt-2">
              <Button onClick={() => navigate("/")} variant="secondary" type="button" className="mr-2">
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </div>
          )}
        </form>
      </Form>

      {isRecipeGetError && <NotFound backNav="/" />}
    </div>
  );
};
