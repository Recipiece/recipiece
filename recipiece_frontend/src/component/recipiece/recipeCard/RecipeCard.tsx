import { DataTestId } from "@recipiece/constant";
import { RecipeSchema } from "@recipiece/types";
import { MoreVertical } from "lucide-react";
import { FC, useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGetSelfQuery } from "../../../api";
import { useLocalStorage } from "../../../hooks";
import { StorageKeys } from "../../../util";
import { Button, Card, CardContent, CardFooter, CardHeader, CardTitle, DropdownMenu, DropdownMenuTrigger } from "../../shadcn";
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
  const [cardStyle, setCardStyle] = useState<React.CSSProperties>();
  const [selectedTheme] = useLocalStorage(StorageKeys.UI_THEME, "system");

  const onView = useCallback(() => {
    navigate(`/recipe/view/${recipe.id}`);
  }, [recipe, navigate]);

  useEffect(() => {
    if (recipe.image_url) {
      let newBgcolor: string;
      const systemWantsDark = selectedTheme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches;
      const isDarkMode = selectedTheme === "dark" || systemWantsDark;

      if (isDarkMode) {
        newBgcolor = "rgba(0, 0, 0, 0.8)";
      } else {
        newBgcolor = "rgba(255,255,255,0.8)";
      }

      setCardStyle({
        backgroundImage: `url(${recipe.image_url})`,
        backgroundColor: newBgcolor,
        backgroundBlendMode: "overlay",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
      });
    }
  }, [recipe.image_url, selectedTheme]);

  return (
    <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
      <Card className="flex h-full flex-col hover:drop-shadow-md" style={cardStyle}>
        <CardHeader data-testid={DataTestId.RecipeCard.CONTAINER_CARD_HEADER(recipe.id)} onClick={onView} className="hover:cursor-pointer">
          <Shelf>
            <CardTitle className="line-clamp-2 max-h-32 overflow-hidden" data-testid={DataTestId.RecipeCard.CARD_TITLE(recipe.id)}>
              {recipe.name}
            </CardTitle>
            <ShelfSpacer />
          </Shelf>
        </CardHeader>
        <CardContent data-testid={DataTestId.RecipeCard.CONTAINER_CARD_CONTENT(recipe.id)} className="grow hover:cursor-pointer" onClick={onView}>
          <p data-testid={DataTestId.RecipeCard.PARAGRAPH_CARD_DESCRIPTION(recipe.id)} className="line-clamp-3 max-h-32 overflow-hidden">
            {recipe.description}
          </p>
        </CardContent>
        <CardFooter>
          <div className="flex w-full flex-row items-center">
            <MembershipAvatar entity={recipe} membershipId={userKitchenMembershipId} />
            <DropdownMenuTrigger className="ml-auto" asChild>
              <Button data-testid={DataTestId.RecipeCard.BUTTON_RECIPE_CONTEXT_MENU_TRIGGER(recipe.id)} variant="ghost" onClick={() => setIsMenuOpen(!isMenuOpen)}>
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
