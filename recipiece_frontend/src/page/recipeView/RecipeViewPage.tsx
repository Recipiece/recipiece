import Fraction from "fraction.js";
import { MoreVertical } from "lucide-react";
import { FC, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useParams } from "react-router-dom";
import { useGetRecipeByIdQuery, useGetSelfQuery } from "../../api";
import {
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
  SharedAvatar
} from "../../component";
import { Recipe, RecipeIngredient } from "../../data";
import { useLayout } from "../../hooks";
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

  const userKitchenMembershipId = (originalRecipe?.shares ?? [])[0]?.user_kitchen_membership_id;

  const { mobileMenuPortalRef } = useContext(RecipieceMenuBarContext);
  const { isMobile } = useLayout();

  const { data: currentUser, isLoading: isLoadingCurrentUser } = useGetSelfQuery();

  const isLoading = useMemo(() => {
    return isLoadingCurrentUser || isLoadingRecipe;
  }, [isLoadingCurrentUser, isLoadingRecipe]);

  const [recipe, setRecipe] = useState<Recipe | undefined>(originalRecipe);
  const [checkedOffSteps, setCheckedOffSteps] = useState<number[]>([]);
  const [checkedOffIngredients, setCheckedOffIngredients] = useState<number[]>([]);

  useEffect(() => {
    if (originalRecipe) {
      setRecipe({ ...originalRecipe });
    }

    return () => {
      setRecipe(undefined);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const onIngredientConverted = useCallback((ingredient: RecipeIngredient, newAmount: string, newUnit: string) => {
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
          servings: !!prev?.servings ? prev.servings * scaleFactor : undefined,
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
              canShare={recipe!.user_id === currentUser?.id}
              canAddToShoppingList
              canAddToCookbook={recipe!.user_id === currentUser?.id}
              canScale
              onScale={onScaleIngredients}
              canReset
              onReset={onResetChanges}
            />
          </DropdownMenu>
        )}
      </>
    );
  }, [currentUser, onResetChanges, onScaleIngredients, recipe]);

  return (
    <div className="p-4">
      <div>
        <div className="grid gap-3">
          <LoadingGroup isLoading={isLoading} className="h-[40px] w-full">
            <div className="flex flex-row items-center gap-2">
              <H2 className="text-4xl font-medium">{recipe?.name}</H2>
              <SharedAvatar userKitchenMembershipId={userKitchenMembershipId} />
              {recipe && (
                <>
                  {isMobile && mobileMenuPortalRef?.current && createPortal(dropdownMenuComponent, mobileMenuPortalRef.current)}
                  {!isMobile && <span className="ml-auto">{dropdownMenuComponent}</span>}
                </>
              )}
            </div>
          </LoadingGroup>
          <LoadingGroup isLoading={isLoading} className="h-[96px] w-full">
            <p>{recipe?.description}</p>
            {recipe?.servings && (
              <p className="text-xs">
                Makes {recipe.servings} serving{recipe.servings > 1 ? "s" : ""}
              </p>
            )}
          </LoadingGroup>
        </div>

        {recipe && (
          <div className="flex flex-col-reverse gap-2 mt-2 sm:flex-row">
            <Card className="p-2 sm:p-4 basis-0 sm:basis-8/12">
              <CardTitle>Steps</CardTitle>
              <CardContent className="p-1 sm:p-4">
                <div className="flex flex-col gap-2">
                  {(recipe?.steps || []).map((step) => {
                    return (
                      <div key={step.id} className="flex flex-row gap-1 items-top">
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
            <Card className="p-2 sm:p-4 basis-0 sm:basis-4/12">
              <CardTitle className="mb-1">Ingredients</CardTitle>
              <CardContent>
                <div className="flex flex-col gap-1">
                  {(recipe?.ingredients ?? []).map((ing) => {
                    return (
                      <div key={ing.id} className="flex flex-row gap-2 items-center">
                        <Checkbox checked={checkedOffIngredients.includes(ing.id)} onClick={() => onIngredientChecked(ing.id)} />
                        <span
                          className={`inline cursor-pointer ${checkedOffIngredients.includes(ing.id) ? "line-through" : ""}`}
                          onClick={() => onIngredientChecked(ing.id)}
                        >
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
        )}
        {recipeError && <NotFound backNav="/" />}
      </div>
    </div>
  );
};
