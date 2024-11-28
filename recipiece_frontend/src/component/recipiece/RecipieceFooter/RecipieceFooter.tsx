import { Book, CirclePlus, CircleUserRound, Home, ShoppingBasket } from "lucide-react";
import { FC, useCallback, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { DialogContext } from "../../../context";
import { CreateCookbookForm, CreateShoppingListForm, MobileCreateMenuDialogOption } from "../../../dialog";
import { Button, useToast } from "../../shadcn";
import { Cookbook, ShoppingList } from "../../../data";
import { useCreateCookbookMutation, useCreateShoppingListMutation } from "../../../api";

export const RecipieceFooter: FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { pushDialog, popDialog } = useContext(DialogContext);

  const { mutateAsync: createCookbook } = useCreateCookbookMutation({
    onSuccess: () => {
      popDialog("createCookbook");
      toast({
        title: "Cookbook Created",
        description: "Your cookbook has been successfully created!",
      });
    },
    onFailure: () => {
      popDialog("createCookbook");
      toast({
        title: "Could not Create Cookbook",
        description: "This cookbook couldn't be created. Try again later.",
        variant: "destructive",
      });
    },
  });

  const { mutateAsync: createShoppingList } = useCreateShoppingListMutation({
    onSuccess: (data) => {
      toast({
        title: "Shopping List Created",
        description: "Your shopping list has been successfully created!",
      });
      navigate(`/shopping-list/${data.id}`);
    },
    onFailure: () => {
      toast({
        title: "Could not Create Shopping List",
        description: "This shopping list couldn't be created. Try again later.",
        variant: "destructive",
      });
    },
  });

  const onCreateCookbook = async (cookbookData: CreateCookbookForm) => {
    const createdCookbook = await createCookbook({ ...cookbookData });
    navigate(`/cookbook/${createdCookbook.data.id}`);
  };

  const onCreateShoppingList = async (shoppingListData: CreateShoppingListForm) => {
    const createdShoppingList = await createShoppingList({ ...shoppingListData });
    navigate(`/shopping-list/${createdShoppingList.data.id}`);
  };

  const onCreatePressed = useCallback(() => {
    pushDialog("mobileCreateMenu", {
      onClose: () => popDialog("mobileCreateMenu"),
      onSubmit: (createType: MobileCreateMenuDialogOption) => {
        popDialog("mobileCreateMenu");
        switch (createType) {
          case "cookbook":
            pushDialog("createCookbook", {
              onSubmit: onCreateCookbook,
              onClose: () => popDialog("createCookbook"),
            });
            break;
          case "recipe_from_url":
            navigate("/recipe/edit/new?source=url");
            break;
          case "recipe":
            navigate("/recipe/edit/new");
            break;
          case "shopping_list":
            pushDialog("createShoppingList", {
              onSubmit: onCreateShoppingList,
              onClose: () => popDialog("createShoppingList"),
            });
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
