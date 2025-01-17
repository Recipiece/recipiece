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
  useLogoutUserMutation
} from "../../../api";
import { DialogContext } from "../../../context";
import { Cookbook, ShoppingList } from "../../../data";
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
  // const { activeTimers, createTimer } = useContext(TimerContext);
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

  // const onStartCreateTimer = useCallback(() => {
  //   pushDialog("createTimer", {
  //     onSubmit: async (timerData: CreateTimerForm) => {
  //       const hoursMs = timerData.hours * 60 * 60 * 1000;
  //       const minutesMs = timerData.minutes * 60 * 1000;
  //       const secondsMs = timerData.seconds * 1000;
  //       try {
  //         await createTimer({
  //           duration_ms: hoursMs + minutesMs + secondsMs,
  //         });
  //         toast({
  //           title: "Timer Created",
  //           description: "Your timer has been created",
  //         });
  //       } catch {
  //         toast({
  //           title: "Could Not Create Timer",
  //           description: "This timer couldn't be created. Try again later.",
  //           variant: "destructive",
  //         });
  //       } finally {
  //         popDialog("createTimer");
  //       }
  //     },
  //     onClose: () => popDialog("createTimer"),
  //   });
  // }, [createTimer, popDialog, pushDialog, toast]);

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
          // case "timer":
          //   onStartCreateTimer();
          //   break;
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
      onSubmit: (shoppingList: ShoppingList) => {
        popDialog("mobileShoppingLists");
        navigate(`/shopping-list/${shoppingList.id}`);
      },
    });
  }, [navigate, popDialog, pushDialog]);

  const onMobileViewCookbooks = useCallback(() => {
    pushDialog("mobileCookbooks", {
      onClose: () => popDialog("mobileCookbooks"),
      onSubmit: (cookbook: Cookbook) => {
        popDialog("mobileCookbooks");
        navigate(`/cookbook/${cookbook.id}`);
      },
    });
  }, [navigate, popDialog, pushDialog]);

  const onMobileViewMealPlans = useCallback(() => {
    pushDialog("mobileMealPlans", {
      onClose: () => popDialog("mobileMealPlans"),
      onSubmit: (cookbook: Cookbook) => {
        popDialog("mobileMealPlans");
        navigate(`/meal-plan/view/${cookbook.id}`);
      },
    });
  }, [navigate, popDialog, pushDialog]);

  return (
    <>
      <Menubar className="rounded-none border-0 p-2 sm:p-4 h-12 sm:h-16 bg-white sm:bg-primary text-white">
        <RecipieceHeader className="text-start sm:text-center w-full md:w-auto mr-auto text-primary sm:text-white" />
        <span className="ml-auto block sm:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="link" className="text-primary">
                <CircleUserRound />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => navigate("/kitchen")}>
                My Kitchen
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/account")}>
                My Account
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onLogout}>Sign Out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </span>
        <span className="ml-auto block sm:hidden" ref={mobileMenuPortalRef} />
        <span className="hidden w-0 sm:w-auto sm:block">
          <MenubarMenu>
            <MenubarTrigger onClick={onGoHome}>Home</MenubarTrigger>
          </MenubarMenu>
        </span>

        <span className="hidden w-0 sm:w-auto sm:block">
          <MenubarMenu>
            <MenubarTrigger>Recipes</MenubarTrigger>
            <MenubarContent>
              <MenubarItem onClick={() => navigate("/recipe/edit/new?source=url")}>Recipe From URL</MenubarItem>
              <MenubarItem onClick={() => navigate("/recipe/edit/new")}>Recipe From Scratch</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </span>

        <span className="hidden w-0 sm:w-auto sm:block">
          <MenubarMenu>
            <MenubarTrigger>Meal Plans</MenubarTrigger>
            <MenubarContent>
              <MenubarItem onClick={onStartCreateMealPlan}>
                <Plus size={16} className="mr-2" />
                New Meal Plan
              </MenubarItem>
              <LoadingGroup isLoading={isLoadingMealPlans} className="w-full h-10">
                {!!mealPlans?.data?.length && <Separator />}
                {(mealPlans?.data || []).map((mealPlan) => {
                  return (
                    <MenubarItem onClick={() => navigate(`/meal-plan/view/${mealPlan.id}`)} key={mealPlan.id}>
                      {mealPlan.name}
                    </MenubarItem>
                  );
                })}
              </LoadingGroup>
            </MenubarContent>
          </MenubarMenu>
        </span>

        <span className="hidden w-0 sm:w-auto sm:block">
          <MenubarMenu>
            <MenubarTrigger>Cookbooks</MenubarTrigger>
            <MenubarContent>
              <MenubarItem onClick={onStartCreateCookbook}>
                <Plus size={16} className="mr-2" /> New Cookbook
              </MenubarItem>
              <LoadingGroup isLoading={isLoadingCookbooks} className="w-full h-10">
                {!!cookbooks?.data?.length && <Separator />}
                {(cookbooks?.data || []).map((cookbook) => {
                  return (
                    <MenubarItem onClick={() => navigate(`/cookbook/${cookbook.id}`)} key={cookbook.id}>
                      {cookbook.name}
                    </MenubarItem>
                  );
                })}
                {/* {cookbooks?.data && <Pager shortForm={true} page={cookbooksPage} onPage={setCookbooksPage} hasNextPage={cookbooks?.hasNextPage} />} */}
              </LoadingGroup>
            </MenubarContent>
          </MenubarMenu>
        </span>

        <span className="hidden w-0 sm:w-auto sm:block">
          <MenubarMenu>
            <MenubarTrigger>Shopping Lists</MenubarTrigger>
            <MenubarContent>
              <MenubarItem onClick={onStartCreateShoppingList}>
                <Plus size={16} className="mr-2" /> New Shopping List
              </MenubarItem>
              <LoadingGroup isLoading={isLoadingShoppingLists} className="w-full h-10">
                {!!shoppingLists?.data?.length && <Separator />}
                {(shoppingLists?.data || []).map((shoppingList) => {
                  return (
                    <ShoppingListMenuItem key={shoppingList.id} onClick={() => navigate(`/shopping-list/${shoppingList.id}`)} shoppingList={shoppingList} />
                    // <MenubarItem key={shoppingList.id} onClick={() => navigate(`/shopping-list/${shoppingList.id}`)}>
                    //   {shoppingList.name}
                    // </MenubarItem>
                  );
                })}
                {/* {shoppingLists?.data && <Pager shortForm={true} page={shoppingListsPage} onPage={setShoppingListsPage} hasNextPage={shoppingLists?.has_next_page} />} */}
              </LoadingGroup>
            </MenubarContent>
          </MenubarMenu>
        </span>

        {/* <span className="hidden w-0 sm:w-auto sm:block">
          <MenubarMenu>
            <MenubarTrigger>Timers</MenubarTrigger>
            <MenubarContent>
              <MenubarItem onClick={onStartCreateTimer}>
                <Plus size={16} className="mr-2" />
                New Timer
              </MenubarItem>
              {activeTimers.length > 0 && <Separator />}
              {activeTimers.map((activeTimer) => {
                return (
                  <Fragment key={activeTimer.id}>
                    <TimerMenuItem timer={activeTimer} />
                  </Fragment>
                );
              })}
            </MenubarContent>
          </MenubarMenu>
        </span> */}

        <span className="hidden w-0 sm:w-auto sm:block">
          <MenubarMenu>
            <MenubarTrigger>Account</MenubarTrigger>
            <MenubarContent>
              <MenubarItem onClick={() => navigate("/kitchen")}>My Kitchen</MenubarItem>
              <MenubarItem onClick={() => navigate("/account")}>My Account</MenubarItem>
              <MenubarSeparator />
              <MenubarItem onClick={onLogout}>Sign Out</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </span>
      </Menubar>

      <footer className="visible sm:invisible w-full fixed bottom-0 left-0 h-16 bg-primary text-white">
        <div className="h-full flex flex-row justify-center items-center">
          <Button onClick={() => navigate("/")} variant="link" className="text-white grow">
            <Home />
          </Button>

          <Button className="text-white grow" onClick={onMobileViewCookbooks}>
            <Book />
          </Button>

          <Button onClick={onCreatePressed} variant="link" className="text-white grow">
            <CirclePlus />
          </Button>

          <Button onClick={onMobileViewShoppingLists} className="text-white grow">
            <ShoppingBasket />
          </Button>

          <Button onClick={onMobileViewMealPlans} className="text-white grow">
            <GanttChart />
          </Button>
        </div>
      </footer>
    </>
  );
};
