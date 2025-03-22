import { DataTestId } from "@recipiece/constant";
import { RecipeSchema } from "@recipiece/types";
import { MoreVertical } from "lucide-react";
import { FC, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGetSelfQuery } from "../../../api";
import {
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  DropdownMenu,
  DropdownMenuTrigger,
} from "../../shadcn";
import { Shelf, ShelfSpacer } from "../Layout";
import { MembershipAvatar } from "../MembershipAvatar";
import { RecipeContextMenu } from "../RecipeContextMenu";

export interface RecipeCardProps {
  readonly recipe: RecipeSchema;
  readonly cookbookId?: number;
}

export const RecipeCard: FC<RecipeCardProps> = ({ recipe, cookbookId }) => {
  const navigate = useNavigate();
  const { data: user } = useGetSelfQuery();
  const userKitchenMembershipId = recipe.user_kitchen_membership_id;
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const onView = useCallback(() => {
    navigate(`/recipe/view/${recipe.id}`);
  }, [recipe, navigate]);

  return (
    <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
      <Card className="flex h-full flex-col hover:drop-shadow-md">
        <CardHeader
          data-testid={DataTestId.RecipeCard.CONTAINER_CARD_HEADER(recipe.id)}
          onClick={onView}
          className="hover:cursor-pointer"
        >
          <Shelf>
            <CardTitle data-testid={DataTestId.RecipeCard.CARD_TITLE(recipe.id)}>{recipe.name}</CardTitle>
            <ShelfSpacer />
          </Shelf>
        </CardHeader>
        <CardContent
          data-testid={DataTestId.RecipeCard.CONTAINER_CARD_CONTENT(recipe.id)}
          className="grow hover:cursor-pointer"
          onClick={onView}
        >
          <p
            data-testid={DataTestId.RecipeCard.PARAGRAPH_CARD_DESCRIPTION(recipe.id)}
            className="line-clamp-3 max-h-32 overflow-hidden"
          >
            {recipe.description}
          </p>
        </CardContent>
        <CardFooter>
          <div className="flex w-full flex-row items-center">
            <MembershipAvatar entity={recipe} membershipId={userKitchenMembershipId} />
            <DropdownMenuTrigger className="ml-auto" asChild>
              <Button
                data-testid={DataTestId.RecipeCard.BUTTON_RECIPE_CONTEXT_MENU_TRIGGER(recipe.id)}
                variant="ghost"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <MoreVertical />
              </Button>
            </DropdownMenuTrigger>
            <RecipeContextMenu
              dataTestId={DataTestId.RecipeCard.RECIPE_CONTEXT_MENU(recipe.id)}
              recipe={recipe}
              cookbookId={cookbookId}
              canRemoveFromCookbook={!!cookbookId}
              canDelete={recipe.user_id === user?.id}
              canEdit={recipe.user_id === user?.id}
              canFork={recipe.user_id !== user?.id}
              canAddToCookbook={recipe.user_id === user?.id}
              canAddToShoppingList
            />
          </div>
        </CardFooter>
      </Card>
    </DropdownMenu>
  );
};
