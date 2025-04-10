import { RecipeIngredientSchema, RecipeSchema } from "@recipiece/types";
import Fraction from "fraction.js";
import { MoreVertical } from "lucide-react";
import { FC, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useParams } from "react-router-dom";
import { useGetRecipeByIdQuery, useGetSelfQuery } from "../../api";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardTitle,
  Checkbox,
  DropdownMenu,
  DropdownMenuTrigger,
  H2,
  LoadingGroup,
  NotFound,
  RecipeContextMenu,
  RecipieceMenuBarContext,
} from "../../component";
import { useGetRecipeImageBackgroundStyle, useLayout } from "../../hooks";
import { formatIngredientAmount } from "../../util";
import { IngredientContextMenu } from "./IngredientContextMenu";

export const RecipeViewPage: FC = () => {
  const { id } = useParams();
  const {
    data: originalRecipe,
    isLoading: isLoadingRecipe,
    error: recipeError,
  } = useGetRecipeByIdQuery(+id!, {
    enabled: !!id,
  });

  const { mobileMenuPortalRef } = useContext(RecipieceMenuBarContext);
  const { isMobile, isTablet } = useLayout();
  const { baseStyles, imageUrl } = useGetRecipeImageBackgroundStyle(originalRecipe);

  const { data: currentUser, isLoading: isLoadingCurrentUser } = useGetSelfQuery();

  const isLoading = useMemo(() => {
    return isLoadingCurrentUser || isLoadingRecipe;
  }, [isLoadingCurrentUser, isLoadingRecipe]);

  const [recipe, setRecipe] = useState<RecipeSchema | undefined>(originalRecipe);
  const [checkedOffSteps, setCheckedOffSteps] = useState<number[]>([]);
  const [checkedOffIngredients, setCheckedOffIngredients] = useState<number[]>([]);

  useEffect(() => {
    if (originalRecipe) {
      setRecipe({ ...originalRecipe });
    }

    return () => {
      setRecipe(undefined);
    };
  }, [originalRecipe]);

  const onStepChecked = useCallback(
    (stepId: number) => {
      if (checkedOffSteps.includes(stepId)) {
        setCheckedOffSteps((oldSteps) => {
          return oldSteps.filter((v) => v !== stepId);
        });
      } else {
        setCheckedOffSteps([...checkedOffSteps, stepId]);
      }
    },
    [checkedOffSteps]
  );

  const onIngredientChecked = useCallback(
    (ingId: number) => {
      if (checkedOffIngredients.includes(ingId)) {
        setCheckedOffIngredients((oldIngredients) => {
          return oldIngredients.filter((v) => v !== ingId);
        });
      } else {
        setCheckedOffIngredients([...checkedOffIngredients, ingId]);
      }
    },
    [checkedOffIngredients]
  );

  const onIngredientConverted = useCallback((ingredient: RecipeIngredientSchema, newAmount: string, newUnit: string) => {
    setRecipe((prev) => {
      if (prev) {
        return {
          ...prev,
          ingredients: (prev?.ingredients ?? []).map((ing) => {
            if (ing.id === ingredient.id) {
              return { ...ing, amount: newAmount, unit: newUnit };
            } else {
              return { ...ing };
            }
          }),
        };
      } else {
        return undefined;
      }
    });
  }, []);

  const onScaleIngredients = useCallback((scaleFactor: number) => {
    setRecipe((prev) => {
      if (prev) {
        return {
          ...prev,
          servings: prev?.servings ? prev.servings * scaleFactor : undefined,
          ingredients: (prev?.ingredients || []).map((ing) => {
            if (ing.amount) {
              try {
                const fractional = new Fraction(ing.amount);
                return { ...ing, amount: fractional.mul(new Fraction(scaleFactor)).toString(2) };
              } catch {
                // couldn't do anything, just return the ingredient
                return { ...ing };
              }
            } else {
              return { ...ing };
            }
          }),
        };
      } else {
        return undefined;
      }
    });
  }, []);

  const onResetChanges = useCallback(() => {
    setRecipe(originalRecipe ? { ...originalRecipe } : undefined);
  }, [originalRecipe]);

  const dropdownMenuComponent = useMemo(() => {
    return (
      <>
        {currentUser && recipe && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="text-primary">
                <MoreVertical />
              </Button>
            </DropdownMenuTrigger>
            <RecipeContextMenu
              recipe={recipe!}
              canFork={recipe!.user_id !== currentUser?.id}
              canDelete={recipe!.user_id === currentUser?.id}
              canEdit={recipe!.user_id === currentUser?.id}
              canAddToShoppingList
              canAddToCookbook={recipe!.user_id === currentUser?.id}
              canScale
              onScale={onScaleIngredients}
              canReset
              onReset={onResetChanges}
              canAddToMealPlan
            />
          </DropdownMenu>
        )}
      </>
    );
  }, [currentUser, onResetChanges, onScaleIngredients, recipe]);

  return (
    <div>
      {(isMobile || isTablet) && imageUrl && <div className="w-[calc(100%+16px)] h-64 mb-2 m-[-8px]" style={baseStyles} />}
      <div>
        <div className="grid gap-3">
          <LoadingGroup isLoading={isLoading} className="h-[40px] w-full">
            <div className="flex flex-row items-center gap-2">
              <H2 className="flex-grow">{recipe?.name}</H2>
              {recipe && (
                <>
                  {isMobile && mobileMenuPortalRef?.current && createPortal(dropdownMenuComponent, mobileMenuPortalRef.current)}
                  {!isMobile && <span className="ml-auto">{dropdownMenuComponent}</span>}
                </>
              )}
            </div>
          </LoadingGroup>
          <LoadingGroup isLoading={isLoading} className="h-[96px] w-full">
            <div className="flex flex-col gap-2">
              <div>
                <p>{recipe?.description}</p>
                {recipe?.servings && (
                  <p className="text-xs">
                    Makes {recipe.servings} serving{recipe.servings > 1 ? "s" : ""}
                  </p>
                )}
              </div>
              {recipe?.tags && (
                <div className="flex flex-row flex-wrap gap-2">
                  {recipe.tags.map((tag) => {
                    return <Badge key={tag.id}>{tag.content}</Badge>;
                  })}
                </div>
              )}
            </div>
          </LoadingGroup>
        </div>

        {recipe && (
          <div className="mt-2 flex flex-col-reverse gap-2 sm:flex-row">
            <Card className="basis-0 p-2 sm:basis-8/12 sm:p-4">
              <CardTitle>Steps</CardTitle>
              <CardContent className="p-1 sm:p-4">
                <div className="flex flex-col gap-2">
                  {(recipe?.steps || []).map((step) => {
                    return (
                      <div key={step.id} className="items-top flex flex-row gap-1">
                        <Checkbox checked={checkedOffSteps.includes(step.id)} onClick={() => onStepChecked(step.id)} className="mt-1" />
                        <span>{step.order + 1}. </span>
                        <p onClick={() => onStepChecked(step.id)} className={`inline cursor-pointer ${checkedOffSteps.includes(step.id) ? "line-through" : ""}`}>
                          {step.content}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
            <div className="flex flex-col gap-2 basis-0 sm:basis-4/12">
              {imageUrl && !isMobile && !isTablet && <div style={baseStyles} className="rounded-sm w-full basis-[256px] shrink-0" />}
              <Card className="p-2 sm:p-4 basis-full shrink">
                <CardTitle className="mb-1">Ingredients</CardTitle>
                <CardContent>
                  <div className="flex flex-col gap-1">
                    {(recipe?.ingredients ?? []).map((ing) => {
                      return (
                        <div key={ing.id} className="flex flex-row items-center gap-2">
                          <Checkbox checked={checkedOffIngredients.includes(ing.id)} onClick={() => onIngredientChecked(ing.id)} />
                          <span className={`inline cursor-pointer ${checkedOffIngredients.includes(ing.id) ? "line-through" : ""}`} onClick={() => onIngredientChecked(ing.id)}>
                            {(!!ing.amount || !!ing.unit) && (
                              <span>
                                {formatIngredientAmount(ing.amount ?? "")} {ing.unit ?? ""}{" "}
                              </span>
                            )}
                            <span>{ing.name}</span>
                          </span>
                          <IngredientContextMenu ingredient={ing} onIngredientConverted={onIngredientConverted} onIngredientRelativeScaled={onScaleIngredients} />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
        {recipeError && <NotFound backNav="/" />}
      </div>
    </div>
  );
};
