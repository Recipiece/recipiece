import { Book, CirclePlus, CircleUserRound, Home, ShoppingBasket } from "lucide-react";
import { FC, useCallback, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { DialogContext } from "../../../context";
import { MobileCreateMenuDialogOption } from "../../../dialog";
import { Button } from "../../shadcn";
import { Cookbook, ShoppingList } from "../../../data";

export const RecipieceFooter: FC = () => {
  const navigate = useNavigate();
  const { pushDialog, popDialog } = useContext(DialogContext);

  const onCreatePressed = useCallback(() => {
    pushDialog("mobileCreateMenu", {
      onClose: () => popDialog("mobileCreateMenu"),
      onSubmit: (createType: MobileCreateMenuDialogOption) => {
        popDialog("mobileCreateMenu");
        switch (createType) {
          case "cookbook":
            pushDialog("createCookbook", {});
            break;
          case "recipe_from_url":
            navigate("/recipe/edit/new?source=url");
            break;
          case "recipe":
            navigate("/recipe/edit/new");
            break;
          case "shopping_list":
            pushDialog("createShoppingList", {});
            break;
        }
      },
    });
  }, [pushDialog, popDialog]);

  const onShoppingListsPressed = useCallback(() => {
    pushDialog("mobileShoppingLists", {
      onSubmit: (list: ShoppingList) => {
        popDialog("mobileShoppingLists");
        navigate(`/shopping-list/${list.id}`);
      },
    });
  }, [pushDialog, popDialog]);

  const onCookbooksPressed = useCallback(() => {
    pushDialog("mobileCookbooks", {
      onSubmit: (cookbook: Cookbook) => {
        popDialog("mobileCookbooks");
        navigate(`/cookbook/${cookbook.id}`);
      },
    });
  }, [pushDialog, popDialog]);

  return (
    <footer className="visible sm:invisible w-full fixed bottom-0 left-0 h-16 bg-primary text-white">
      <div className="h-full flex flex-row justify-center items-center">
        <Button onClick={() => navigate("/")} variant="link" className="text-white grow">
          <Home />
        </Button>

        <Button className="text-white grow" onClick={onCookbooksPressed}>
          <Book />
        </Button>

        <Button onClick={onCreatePressed} variant="link" className="text-white grow">
          <CirclePlus />
        </Button>

        <Button onClick={onShoppingListsPressed} className="text-white grow">
          <ShoppingBasket />
        </Button>

        <Button onClick={() => navigate("/account")} variant="link" className="text-white grow">
          <CircleUserRound />
        </Button>
      </div>
    </footer>
  );
};
