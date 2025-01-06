import { Avatar } from "@radix-ui/react-avatar";
import { MoreVertical } from "lucide-react";
import { FC, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useGetSelfQuery, useGetUserKitchenMembershipQuery } from "../../../api";
import { Recipe } from "../../../data";
import { AvatarFallback, Button, Card, CardContent, CardFooter, CardHeader, CardTitle, DropdownMenu, DropdownMenuTrigger, Tooltip, TooltipContent, TooltipTrigger } from "../../shadcn";
import { Shelf, ShelfSpacer } from "../Layout";
import { RecipeContextMenu } from "../RecipeContextMenu";

export interface RecipeCardProps {
  readonly recipe: Recipe;
  readonly cookbookId?: number;
}

export const RecipeCard: FC<RecipeCardProps> = ({ recipe, cookbookId }) => {
  const navigate = useNavigate();
  const { data: user } = useGetSelfQuery();

  const userKitchenMembershipId = (recipe.recipe_shares ?? [])[0]?.user_kitchen_membership_id;
  const { data: userKitchenMembership } = useGetUserKitchenMembershipQuery(userKitchenMembershipId, {
    disabled: !userKitchenMembershipId,
  });

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
          <div className="flex flex-row w-full items-center">
            {userKitchenMembership && (
              <Tooltip>
                <div className="w-8 h-8">
                  <TooltipTrigger asChild>
                    <Avatar>
                      <AvatarFallback className="w-8 h-8 cursor-pointer bg-primary text-white">{userKitchenMembership.source_user.username.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </TooltipTrigger>
                </div>
                <TooltipContent>
                  Shared to you by {userKitchenMembership.source_user.username}
                </TooltipContent>
              </Tooltip>
            )}
            <DropdownMenuTrigger asChild className="ml-auto">
              <Button variant="ghost">
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
