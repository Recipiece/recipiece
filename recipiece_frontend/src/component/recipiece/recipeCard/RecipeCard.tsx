import { RecipeSchema } from "@recipiece/types";
import { MoreVertical } from "lucide-react";
import { FC, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGetSelfQuery } from "../../../api";
import { Button, Card, CardContent, CardFooter, CardHeader, CardTitle, DropdownMenu, DropdownMenuTrigger } from "../../shadcn";
import { Shelf, ShelfSpacer } from "../Layout";
import { RecipeContextMenu } from "../RecipeContextMenu";
import { SharedAvatar } from "../SharedAvatar";

export interface RecipeCardProps {
  readonly recipe: RecipeSchema;
  readonly cookbookId?: number;
}

export const RecipeCard: FC<RecipeCardProps> = ({ recipe, cookbookId }) => {
  const navigate = useNavigate();
  const { data: user } = useGetSelfQuery();
  const userKitchenMembershipId = (recipe.shares ?? [])[0]?.user_kitchen_membership_id;
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const onView = useCallback(() => {
    navigate(`/recipe/view/${recipe.id}`);
  }, [recipe, navigate]);

  return (
    <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
      <Card className="flex h-full flex-col hover:drop-shadow-md">
        <CardHeader onClick={onView} className="hover:cursor-pointer">
          <Shelf>
            <CardTitle>{recipe.name}</CardTitle>
            <ShelfSpacer />
          </Shelf>
        </CardHeader>
        <CardContent className="grow hover:cursor-pointer" onClick={onView}>
          <p className="line-clamp-3 max-h-32 overflow-hidden">{recipe.description}</p>
        </CardContent>
        <CardFooter>
          <div className="flex w-full flex-row items-center">
            <SharedAvatar userKitchenMembershipId={userKitchenMembershipId} />
            <DropdownMenuTrigger className="ml-auto" asChild>
              <Button variant="ghost" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                <MoreVertical />
              </Button>
            </DropdownMenuTrigger>
            <RecipeContextMenu
              recipe={recipe}
              cookbookId={cookbookId}
              canRemoveFromCookbook={!!cookbookId}
              canDelete={recipe.user_id === user?.id}
              canEdit={recipe.user_id === user?.id}
              canShare={recipe.user_id === user?.id}
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
