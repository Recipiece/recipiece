import { FC, useCallback, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateCookbookMutation, useCreateShoppingListMutation, useListCookbooksQuery, useListShoppingListsQuery, useLogoutUserMutation } from "../../../api";
import { DialogContext } from "../../../context";
import { CreateCookbookForm, CreateShoppingListForm } from "../../../dialog";
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarTrigger, Separator, useToast } from "../../shadcn";
import { LoadingGroup } from "../LoadingGroup";
import { Pager } from "../Pager";
import { RecipieceHeader } from "../Typography";

export const RecipieceMenubar: FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { pushDialog, popDialog } = useContext(DialogContext);
  const [cookbooksPage, setCookbooksPage] = useState(0);
  const [shoppingListsPage, setShoppingListsPage] = useState(0);

  const { mutateAsync: logout } = useLogoutUserMutation({
    onSuccess: () => {
      navigate("/login");
    },
    onFailure: () => {
      navigate("/login");
    },
  });

  const onGoHome = useCallback(() => {
    navigate("/dashboard");
  }, []);

  const { data: shoppingLists, isLoading: isLoadingShoppingLists } = useListShoppingListsQuery({
    page_number: shoppingListsPage,
  });

  const { data: cookbooks, isLoading: isLoadingCookbooks } = useListCookbooksQuery({
    page_number: cookbooksPage,
  });

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
    await createCookbook({ ...cookbookData });
  };

  const onCreateShoppingList = async (shoppingListData: CreateShoppingListForm) => {
    await createShoppingList({ ...shoppingListData });
  };

  const onStartCreateCookbook = () => {
    pushDialog("createCookbook", {
      onSubmit: onCreateCookbook,
      onClose: () => popDialog("createCookbook"),
    });
  };

  const onStartCreateShoppingList = () => {
    pushDialog("createShoppingList", {
      onSubmit: onCreateShoppingList,
    });
  };

  return (
    <Menubar className="rounded-none border-0 p-4 h-12 bg-primary text-white">
      <RecipieceHeader className="text-center w-full md:w-auto md:mr-auto" />
      <span className="hidden w-0 sm:w-auto sm:block">
        <MenubarMenu>
          <MenubarTrigger onClick={onGoHome}>Home</MenubarTrigger>
        </MenubarMenu>
      </span>

      <span className="hidden w-0 sm:w-auto sm:block">
        <MenubarMenu>
          <MenubarTrigger>Create</MenubarTrigger>
          <MenubarContent>
            <MenubarItem onClick={() => navigate("/recipe/edit/new?source=url")}>Recipe From URL</MenubarItem>
            <MenubarItem onClick={() => navigate("/recipe/edit/new")}>Recipe From Scratch</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </span>

      <span className="hidden w-0 sm:w-auto sm:block">
        <MenubarMenu>
          <MenubarTrigger>Cookbooks</MenubarTrigger>
          <MenubarContent>
            <MenubarItem onClick={onStartCreateCookbook}>New Cookbook</MenubarItem>
            <LoadingGroup isLoading={isLoadingCookbooks} className="w-full h-10">
              {cookbooks?.data && <Separator />}
              {(cookbooks?.data || []).map((cookbook) => {
                return (
                  <MenubarItem onClick={() => navigate(`/cookbook/${cookbook.id}`)} key={cookbook.id}>
                    {cookbook.name}
                  </MenubarItem>
                );
              })}
              {cookbooks?.data && <Pager shortForm={true} page={cookbooksPage} onPage={setCookbooksPage} hasNextPage={cookbooks?.hasNextPage} />}
            </LoadingGroup>
          </MenubarContent>
        </MenubarMenu>
      </span>

      <span className="hidden w-0 sm:w-auto sm:block">
        <MenubarMenu>
          <MenubarTrigger>Shopping Lists</MenubarTrigger>
          <MenubarContent>
            <MenubarItem onClick={onStartCreateShoppingList}>New Shopping List</MenubarItem>
            <LoadingGroup isLoading={isLoadingShoppingLists} className="w-full h-10">
              {shoppingLists?.data && <Separator />}
              {(shoppingLists?.data || []).map((shoppingList) => {
                return (
                  <MenubarItem key={shoppingList.id} onClick={() => navigate(`/shopping-list/${shoppingList.id}`)}>
                    {shoppingList.name}
                  </MenubarItem>
                );
              })}
              {shoppingLists?.data && <Pager shortForm={true} page={shoppingListsPage} onPage={setShoppingListsPage} hasNextPage={shoppingLists?.has_next_page} />}
            </LoadingGroup>
          </MenubarContent>
        </MenubarMenu>
      </span>

      <span className="hidden w-0 sm:w-auto sm:block">
        <MenubarMenu>
          <MenubarTrigger>Account</MenubarTrigger>
          <MenubarContent>
            <MenubarItem onClick={() => navigate("/account")}>My Account</MenubarItem>
            <MenubarItem onClick={() => logout()}>Sign Out</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </span>
    </Menubar>
  );
};
