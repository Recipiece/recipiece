import { CookbookSchema, ShoppingListSchema } from "@recipiece/types";
import { Book, CirclePlus, CircleUserRound, GanttChart, Home, Plus, ShoppingBasket } from "lucide-react";
import { createContext, createRef, FC, PropsWithChildren, RefObject, useCallback, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useCreateCookbookMutation,
  useCreateMealPlanMutation,
  useCreateShoppingListMutation,
  useListCookbooksQuery,
  useListMealPlansQuery,
  useListShoppingListsQuery,
  useLogoutUserMutation,
} from "../../../api";
import { DialogContext } from "../../../context";
import { CreateCookbookForm, CreateShoppingListForm, MobileCreateMenuDialogOption, ModifyMealPlanForm } from "../../../dialog";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
  Separator,
  useToast,
} from "../../shadcn";
import { LoadingGroup } from "../LoadingGroup";
import { RecipieceHeader } from "../Typography";
import { ShoppingListMenuItem } from "./ShoppingListMenuItem";
import { MealPlanMenuItem } from "./MealPlanMenuItem";
import { DataTestId } from "@recipiece/constant";
import { CookbookMenuItem } from "./CookbookMenuItem";

export const RecipieceMenuBarContext = createContext<{
  readonly mobileMenuPortalRef: undefined | RefObject<HTMLSpanElement>;
}>({
  mobileMenuPortalRef: undefined,
});

export const RecipieceMenuBarContextProvider: FC<PropsWithChildren> = ({ children }) => {
  const mobileMenuPortalRef = createRef<HTMLSpanElement>();

  return <RecipieceMenuBarContext.Provider value={{ mobileMenuPortalRef: mobileMenuPortalRef }}>{children}</RecipieceMenuBarContext.Provider>;
};

/**
 * The almighty menu bar
 *
 * Both the desktop and mobile behaviors are handled here. The content inside the `footer` is
 * only displayed on mobile views.
 *
 * Some Menubar content is displayed on mobile, but most of it is not shown.
 */
export const RecipieceMenubar: FC = () => {
  const navigate = useNavigate();

  const { toast } = useToast();
  const { mobileMenuPortalRef } = useContext(RecipieceMenuBarContext);
  const { pushDialog, popDialog } = useContext(DialogContext);
  const [cookbooksPage, setCookbooksPage] = useState(0);
  const [shoppingListsPage, setShoppingListsPage] = useState(0);
  const [mealPlansPage, setMealPlansPage] = useState(0);

  const onGoHome = useCallback(() => {
    navigate("/dashboard");
  }, [navigate]);

  const { data: shoppingLists, isLoading: isLoadingShoppingLists } = useListShoppingListsQuery({
    page_number: shoppingListsPage,
  });

  const { data: cookbooks, isLoading: isLoadingCookbooks } = useListCookbooksQuery({
    page_number: cookbooksPage,
  });

  const { data: mealPlans, isLoading: isLoadingMealPlans } = useListMealPlansQuery({
    page_number: mealPlansPage,
  });

  const { mutateAsync: createMealPlan } = useCreateMealPlanMutation();
  const { mutateAsync: createCookbook } = useCreateCookbookMutation();
  const { mutateAsync: createShoppingList } = useCreateShoppingListMutation();
  const { mutateAsync: logoutUser } = useLogoutUserMutation();

  const onLogout = useCallback(async () => {
    try {
      await logoutUser();
    } catch {
      // noop
    } finally {
      navigate("/login");
    }
  }, [logoutUser, navigate]);

  const onStartCreateCookbook = useCallback(() => {
    pushDialog("createCookbook", {
      onSubmit: async (data: CreateCookbookForm) => {
        try {
          const createdCookbook = await createCookbook({ ...data });
          toast({
            title: "Cookbook Created",
            description: "Your cookbook has been successfully created!",
          });
          navigate(`/cookbook/${createdCookbook.id}`);
        } catch {
          toast({
            title: "Could not Create Cookbook",
            description: "This cookbook couldn't be created. Try again later.",
            variant: "destructive",
          });
        } finally {
          popDialog("createCookbook");
        }
      },
      onClose: () => popDialog("createCookbook"),
    });
  }, [pushDialog, popDialog, createCookbook, toast, navigate]);

  const onStartCreateShoppingList = useCallback(() => {
    pushDialog("createShoppingList", {
      onSubmit: async (data: CreateShoppingListForm) => {
        try {
          const createdList = await createShoppingList({ ...data });
          toast({
            title: "Shopping List Created",
            description: "Your shopping list has been successfully created!",
          });
          navigate(`/shopping-list/${createdList.id}`);
        } catch {
          toast({
            title: "Could not Create Shopping List",
            description: "This shopping list couldn't be created. Try again later.",
            variant: "destructive",
          });
        } finally {
          popDialog("createShoppingList");
        }
      },
      onClose: () => {
        popDialog("createShoppingList");
      },
    });
  }, [pushDialog, popDialog, createShoppingList, navigate, toast]);

  const onStartCreateMealPlan = useCallback(() => {
    pushDialog("modifyMealPlan", {
      onClose: () => popDialog("modifyMealPlan"),
      onSubmit: async (data: ModifyMealPlanForm) => {
        try {
          const createdMealPlan = await createMealPlan({
            ...data,
          });
          navigate(`/meal-plan/view/${createdMealPlan.id}`);
          toast({
            title: "Meal Plan Created",
            description: "Your meal plan was created!",
          });
        } catch {
          toast({
            title: "Unable to Create Meal Plan",
            description: "Your meal plan could not be created. Try again later.",
            variant: "destructive",
          });
        } finally {
          popDialog("modifyMealPlan");
        }
      },
    });
  }, [createMealPlan, navigate, popDialog, pushDialog, toast]);

  const onCreatePressed = useCallback(() => {
    pushDialog("mobileCreateMenu", {
      onClose: () => popDialog("mobileCreateMenu"),
      onSubmit: (createType: MobileCreateMenuDialogOption) => {
        popDialog("mobileCreateMenu");
        switch (createType) {
          case "cookbook":
            onStartCreateCookbook();
            break;
          case "recipe_from_url":
            navigate("/recipe/edit/new?source=url");
            break;
          case "recipe":
            navigate("/recipe/edit/new");
            break;
          case "shopping_list":
            onStartCreateShoppingList();
            break;
          case "meal_plan":
            onStartCreateMealPlan();
            break;
        }
      },
    });
  }, [pushDialog, popDialog, navigate, onStartCreateCookbook, onStartCreateMealPlan, onStartCreateShoppingList]);

  const onMobileViewShoppingLists = useCallback(() => {
    pushDialog("mobileShoppingLists", {
      onClose: () => popDialog("mobileShoppingLists"),
      onSubmit: (shoppingList: ShoppingListSchema) => {
        popDialog("mobileShoppingLists");
        navigate(`/shopping-list/${shoppingList.id}`);
      },
    });
  }, [navigate, popDialog, pushDialog]);

  const onMobileViewCookbooks = useCallback(() => {
    pushDialog("mobileCookbooks", {
      onClose: () => popDialog("mobileCookbooks"),
      onSubmit: (cookbook: CookbookSchema) => {
        popDialog("mobileCookbooks");
        navigate(`/cookbook/${cookbook.id}`);
      },
    });
  }, [navigate, popDialog, pushDialog]);

  const onMobileViewMealPlans = useCallback(() => {
    pushDialog("mobileMealPlans", {
      onClose: () => popDialog("mobileMealPlans"),
      onSubmit: (cookbook: CookbookSchema) => {
        popDialog("mobileMealPlans");
        navigate(`/meal-plan/view/${cookbook.id}`);
      },
    });
  }, [navigate, popDialog, pushDialog]);

  return (
    <>
      <Menubar data-testid={DataTestId.MenuBar.NAV_DESKTOP_MENU_BAR} className="h-12 rounded-none border-0 p-2 text-white sm:h-16 sm:bg-primary sm:p-4">
        <RecipieceHeader className="mr-auto w-full text-start text-primary dark:text-white sm:text-center sm:text-white md:w-auto" />
        <span className="ml-auto block sm:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button data-testid={DataTestId.MenuBar.MENU_TRIGGER_ACCOUNT} variant="link" className="text-primary dark:text-white">
                <CircleUserRound />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem data-testid={DataTestId.MenuBar.MENU_ITEM_GOTO_KITCHEN} onClick={() => navigate("/kitchen")}>
                Kitchen
              </DropdownMenuItem>
              <DropdownMenuItem data-testid={DataTestId.MenuBar.MENU_ITEM_GOTO_ACCOUNT} onClick={() => navigate("/account")}>
                Account
              </DropdownMenuItem>
              {/* <DropdownMenuItem onClick={() => navigate("/notifications")}>Notifications</DropdownMenuItem> */}
              <DropdownMenuSeparator />
              <DropdownMenuItem data-testid={DataTestId.MenuBar.MENU_ITEM_SIGN_OUT} onClick={onLogout}>
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </span>
        <span className="ml-auto block sm:hidden" ref={mobileMenuPortalRef} />
        <span className="hidden w-0 sm:block sm:w-auto">
          <MenubarMenu>
            <MenubarTrigger data-testid={DataTestId.MenuBar.MENU_ITEM_HOME} onClick={onGoHome}>
              Home
            </MenubarTrigger>
          </MenubarMenu>
        </span>

        <span className="hidden w-0 sm:block sm:w-auto">
          <MenubarMenu>
            <MenubarTrigger data-testid={DataTestId.MenuBar.MENU_TRIGGER_CREATE}>Create</MenubarTrigger>
            <MenubarContent>
              <MenubarItem data-testid={DataTestId.MenuBar.MENU_ITEM_RECIPE_FROM_URL} onClick={() => navigate("/recipe/edit/new?source=url")}>
                Recipe From URL
              </MenubarItem>
              <MenubarItem data-testid={DataTestId.MenuBar.MENU_ITEM_RECIPE_FROM_SCRATCH} onClick={() => navigate("/recipe/edit/new")}>
                Recipe From Scratch
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </span>

        <span className="hidden w-0 sm:block sm:w-auto">
          <MenubarMenu>
            <MenubarTrigger data-testid={DataTestId.MenuBar.MENU_TRIGGER_MEAL_PLAN}>Meal Plans</MenubarTrigger>
            <MenubarContent>
              <MenubarItem data-testid={DataTestId.MenuBar.MENU_ITEM_CREATE_MEAL_PLAN} onClick={onStartCreateMealPlan}>
                <Plus size={16} className="mr-2" />
                New Meal Plan
              </MenubarItem>
              <LoadingGroup isLoading={isLoadingMealPlans} className="h-10 w-full">
                {!!mealPlans?.data?.length && <Separator />}
                {(mealPlans?.data || []).map((mealPlan) => {
                  return (
                    <MealPlanMenuItem
                      data-testid={DataTestId.MenuBar.MENU_ITEM_MEAL_PLAN(mealPlan.id)}
                      onClick={() => navigate(`/meal-plan/view/${mealPlan.id}`)}
                      key={mealPlan.id}
                      mealPlan={mealPlan}
                    />
                  );
                })}
              </LoadingGroup>
            </MenubarContent>
          </MenubarMenu>
        </span>

        <span className="hidden w-0 sm:block sm:w-auto">
          <MenubarMenu>
            <MenubarTrigger data-testid={DataTestId.MenuBar.MENU_TRIGGER_COOKBOOK}>Cookbooks</MenubarTrigger>
            <MenubarContent>
              <MenubarItem data-testid={DataTestId.MenuBar.MENU_ITEM_CREATE_COOKBOOK} onClick={onStartCreateCookbook}>
                <Plus size={16} className="mr-2" /> New Cookbook
              </MenubarItem>
              <LoadingGroup isLoading={isLoadingCookbooks} className="h-10 w-full">
                {!!cookbooks?.data?.length && <Separator />}
                {(cookbooks?.data || []).map((cookbook) => {
                  return (
                    <CookbookMenuItem
                      cookbook={cookbook}
                      data-testid={DataTestId.MenuBar.MENU_ITEM_COOKBOOK(cookbook.id)}
                      onClick={() => navigate(`/cookbook/${cookbook.id}`)}
                      key={cookbook.id}
                    />
                  );
                })}
                {/* {cookbooks?.data && <Pager shortForm={true} page={cookbooksPage} onPage={setCookbooksPage} hasNextPage={cookbooks?.hasNextPage} />} */}
              </LoadingGroup>
            </MenubarContent>
          </MenubarMenu>
        </span>

        <span className="hidden w-0 sm:block sm:w-auto">
          <MenubarMenu>
            <MenubarTrigger data-testid={DataTestId.MenuBar.MENU_TRIGGER_SHOPPING_LIST}>Shopping Lists</MenubarTrigger>
            <MenubarContent>
              <MenubarItem data-testid={DataTestId.MenuBar.MENU_ITEM_CREATE_SHOPPING_LIST} onClick={onStartCreateShoppingList}>
                <Plus size={16} className="mr-2" /> New Shopping List
              </MenubarItem>
              <LoadingGroup isLoading={isLoadingShoppingLists} className="h-10 w-full">
                {!!shoppingLists?.data?.length && <Separator />}
                {(shoppingLists?.data || []).map((shoppingList) => {
                  return (
                    <ShoppingListMenuItem
                      data-testid={DataTestId.MenuBar.MENU_ITEM_SHOPPING_LIST(shoppingList.id)}
                      key={shoppingList.id}
                      onClick={() => navigate(`/shopping-list/${shoppingList.id}`)}
                      shoppingList={shoppingList}
                    />
                  );
                })}
                {/* {shoppingLists?.data && <Pager shortForm={true} page={shoppingListsPage} onPage={setShoppingListsPage} hasNextPage={shoppingLists?.has_next_page} />} */}
              </LoadingGroup>
            </MenubarContent>
          </MenubarMenu>
        </span>

        <span className="hidden w-0 sm:block sm:w-auto">
          <MenubarMenu>
            <MenubarTrigger data-testid={DataTestId.MenuBar.MENU_TRIGGER_ACCOUNT}>Account</MenubarTrigger>
            <MenubarContent>
              <MenubarItem data-testid={DataTestId.MenuBar.MENU_ITEM_GOTO_KITCHEN} onClick={() => navigate("/kitchen")}>
                Kitchen
              </MenubarItem>
              <MenubarItem data-testid={DataTestId.MenuBar.MENU_ITEM_GOTO_ACCOUNT} onClick={() => navigate("/account")}>
                Settings
              </MenubarItem>
              {/* <MenubarItem onClick={() => navigate("/notifications")}>Notifications</MenubarItem> */}
              <MenubarSeparator />
              <MenubarItem data-testid={DataTestId.MenuBar.MENU_ITEM_SIGN_OUT} onClick={onLogout}>
                Sign Out
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </span>
      </Menubar>

      <footer data-testid={DataTestId.MenuBar.FOOTER_MOBILE_MENU_BAR} className="visible fixed bottom-0 left-0 z-50 h-16 w-full bg-primary pb-4 text-white sm:invisible">
        <div className="flex h-full flex-row items-center justify-center">
          <Button data-testid={DataTestId.MenuBar.MENU_ITEM_HOME} onClick={() => navigate("/")} variant="link" className="grow text-white">
            <Home />
          </Button>

          <Button data-testid={DataTestId.MenuBar.MENU_TRIGGER_COOKBOOK} className="grow text-white" onClick={onMobileViewCookbooks}>
            <Book />
          </Button>

          <Button data-testid={DataTestId.MenuBar.MENU_TRIGGER_CREATE} onClick={onCreatePressed} variant="link" className="grow text-white">
            <CirclePlus />
          </Button>

          <Button data-testid={DataTestId.MenuBar.MENU_TRIGGER_SHOPPING_LIST} onClick={onMobileViewShoppingLists} className="grow text-white">
            <ShoppingBasket />
          </Button>

          <Button data-testid={DataTestId.MenuBar.MENU_TRIGGER_MEAL_PLAN} onClick={onMobileViewMealPlans} className="grow text-white">
            <GanttChart />
          </Button>
        </div>
      </footer>
    </>
  );
};
