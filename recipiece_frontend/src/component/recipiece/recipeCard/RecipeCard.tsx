import { MoreVertical } from "lucide-react";
import { FC, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Recipe } from "../../../data";
import { Button, Card, CardContent, CardFooter, CardHeader, CardTitle, DropdownMenu, DropdownMenuTrigger } from "../../shadcn";
import { Shelf, ShelfSpacer } from "../Layout";
import { RecipeContextMenu } from "../RecipeContextMenu";

export interface RecipeCardProps {
  readonly recipe: Recipe;
  readonly cookbookId?: number;
}

export const RecipeCard: FC<RecipeCardProps> = ({ recipe, cookbookId }) => {
  const navigate = useNavigate();

  const onView = useCallback(() => {
    navigate(`/recipe/view/${recipe.id}`);
  }, [recipe, navigate]);

  return (
    <DropdownMenu>
      <Card className="h-full flex flex-col hover:drop-shadow-md">
        <CardHeader onClick={onView} className="hover:cursor-pointer">
          <Shelf>
            <CardTitle>{recipe.name}</CardTitle>
            <ShelfSpacer />
          </Shelf>
        </CardHeader>
        <CardContent className="grow hover:cursor-pointer" onClick={onView}>
          <p className="max-h-32 overflow-hidden line-clamp-3">{recipe.description}</p>
        </CardContent>
        <CardFooter>
          <div className="flex flex-row w-full">
            <DropdownMenuTrigger asChild className="ml-auto">
              <Button variant="ghost">
                <MoreVertical />
              </Button>
            </DropdownMenuTrigger>
            <RecipeContextMenu
              recipe={recipe}
              cookbookId={cookbookId}
              canRemoveFromCookbook={!!cookbookId}
              canDelete
              canEdit
              canShare={!recipe.private}
              canAddToCookbook
              canAddToShoppingList
            />
          </div>
        </CardFooter>
      </Card>
    </DropdownMenu>
  );
};
