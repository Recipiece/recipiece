import { Constant, DataTestId } from "@recipiece/constant";
import { ListRecipesQuerySchema, RecipeSchema } from "@recipiece/types";
import { Plus } from "lucide-react";
import { FC, Fragment, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation, useParams } from "react-router-dom";
import { useAttachRecipeToCookbookMutation, useGetCookbookByIdQuery, useGetSelfQuery, useGetUserKitchenMembershipQuery, useListRecipesQuery } from "../../api";
import {
  Button,
  Grid,
  H2,
  LoadingGroup,
  NotFound,
  Pager,
  RecipeCard,
  RecipeSearch,
  RecipieceMenuBarContext,
  SidebarProvider,
  SidebarTrigger,
  Stack,
  useToast,
} from "../../component";
import { DialogContext } from "../../context";
import { useLayout } from "../../hooks";
import { CookbookContextMenu } from "./CookbookContextMenu";
import { DashboardSidebar } from "./DashboardSidebar";

export const DashboardPage: FC = () => {
  const { cookbookId, membershipId } = useParams();
  const location = useLocation();
  const { pushDialog, popDialog } = useContext(DialogContext);
  const { mobileMenuPortalRef } = useContext(RecipieceMenuBarContext);
  const { isMobile } = useLayout();

  const defaultFilters: ListRecipesQuerySchema = useMemo(() => {
    if (cookbookId) {
      return {
        page_number: 0,
        cookbook_id: +cookbookId,
        search: "",
        shared_recipes_filter: "include",
        cookbook_attachments_filter: "include",
      };
    } else if (membershipId) {
      return {
        page_number: 0,
        search: "",
        user_kitchen_membership_ids: [membershipId],
        shared_recipes_filter: "include",
      };
    } else if (location.pathname.endsWith("/all")) {
      return {
        page_number: 0,
        search: "",
        user_kitchen_membership_ids: [Constant.USER_KITCHEN_MEMBERSHIP_IDS_ALL],
        shared_recipes_filter: "include",
      };
    } else {
      return {
        page_number: 0,
        search: "",
        user_kitchen_membership_ids: [Constant.USER_KITCHEN_MEMBERSHIP_IDS_USER],
        shared_recipes_filter: "exclude",
      };
    }
  }, [cookbookId, location.pathname, membershipId]);

  const [filters, setFilters] = useState<ListRecipesQuerySchema>({ ...defaultFilters });

  const { toast } = useToast();

  const onSearch = async (filters: Partial<ListRecipesQuerySchema>) => {
    setFilters((prev) => {
      return {
        ...prev,
        ...filters,
      };
    });
  };

  /**
   * Handle changing to a cookbook view
   */
  useEffect(() => {
    setFilters({ ...defaultFilters });
  }, [cookbookId, defaultFilters]);

  const onPageChange = useCallback((newPage: number) => {
    setFilters((prev) => {
      return {
        ...prev,
        page_number: newPage,
      };
    });
  }, []);

  const { data: user, isLoading: isLoadingUser } = useGetSelfQuery();
  const { data: recipeData, isLoading: isLoadingRecipes, isFetching: isFetchingRecipes } = useListRecipesQuery(filters);
  const { data: cookbook, isLoading: isLoadingCookbook } = useGetCookbookByIdQuery(cookbookId ? +cookbookId : -1, {
    enabled: !!cookbookId,
  });
  const { data: membership, isLoading: isLoadingMembership } = useGetUserKitchenMembershipQuery(membershipId ? +membershipId : -1, {
    enabled: !!membershipId,
  });
  const { mutateAsync: addRecipeToCookbook } = useAttachRecipeToCookbookMutation();

  const recipes = useMemo(() => {
    return recipeData?.data || [];
  }, [recipeData]);

  const onFindRecipe = useCallback(() => {
    pushDialog("searchRecipesForCookbook", {
      cookbook: cookbook!,
      onSubmit: async (recipe: RecipeSchema) => {
        try {
          await addRecipeToCookbook({ recipe: recipe, cookbook: cookbook! });
          toast({
            title: "Recipe Added to Cookbook",
            description: "The recipe was added to your cookbook.",
          });
        } catch {
          toast({
            title: "Cannot add recipe to cookbook",
            description: "There was an issue trying to add your recipe to this cookbook. Try again later.",
            variant: "destructive",
          });
        } finally {
          popDialog("searchRecipesForCookbook");
        }
      },
      onClose: () => popDialog("searchRecipesForCookbook"),
    });
  }, [addRecipeToCookbook, cookbook, popDialog, pushDialog, toast]);

  const title = useMemo(() => {
    if (cookbookId && cookbook) {
      return cookbook?.name;
    } else if (user && membershipId && membership) {
      if (user.id === membership.source_user.id) {
        return `${membership.destination_user.username}'s Kitchen`;
      } else {
        return `${membership.source_user.username}'s Kitchen`;
      }
    } else if (location.pathname.endsWith("/dashboard/all")) {
      return "All Recipes";
    } else if (location.pathname.endsWith("/dashboard")) {
      return "Your Recipes";
    } else {
      return undefined;
    }
  }, [cookbook, cookbookId, location.pathname, membership, membershipId, user]);

  const isLoading = isLoadingUser || isLoadingRecipes || isFetchingRecipes || (!!cookbookId && isLoadingCookbook) || (!!membershipId && isLoadingMembership);

  const isLoadingTitle = isLoadingUser || (!!cookbookId && isLoadingCookbook) || (!!membershipId && isLoadingMembership);

  return (
    <SidebarProvider className="h-[calc(100%-64px)] min-h-[calc(100%-64px)]">
      <DashboardSidebar />
      <div className="flex flex-col gap-2 w-full h-full">
        <LoadingGroup variant="skeleton" isLoading={isLoadingTitle} className="h-[49px] w-full">
          <div className="flex flex-row gap-2">
            {title && (
              <>
                <H2 className="flex-grow basis-full">
                  <div className="inline sm:flex sm:flex-row">
                    <SidebarTrigger data-testid={DataTestId.DashboardSidebar.SIDEBAR_TRIGGER_MOBILE} className="sm:hidden mr-2" />
                    <span data-testid={DataTestId.DashboardPage.HEADING_TITLE}>{title}</span>
                  </div>
                </H2>
                {!!cookbook &&
                  isMobile &&
                  mobileMenuPortalRef &&
                  mobileMenuPortalRef.current &&
                  createPortal(<CookbookContextMenu cookbook={cookbook} />, mobileMenuPortalRef.current)}
                {!!cookbook && !isMobile && <>{<CookbookContextMenu cookbook={cookbook} />}</>}
              </>
            )}
          </div>
        </LoadingGroup>
        <RecipeSearch dataTestId={DataTestId.DashboardPage.RECIPE_SEARCH_BAR} isLoading={isLoading} onSubmit={onSearch} />
        <LoadingGroup variant="spinner" isLoading={isLoading}>
          <Stack>
            {!isLoadingRecipes && recipes.length === 0 && (
              <>
                <NotFound dataTestId={DataTestId.DashboardPage.NOT_FOUND} message="No recipes to be had, time to get cooking!" />
                {cookbookId && (
                  <div className="text-center">
                    <Button data-testid={DataTestId.DashboardPage.BUTTON_ADD_RECIPE_EMPTY} onClick={onFindRecipe} variant="outline">
                      <Plus size={20} /> <span className="ml-2">Add a recipe</span>
                    </Button>
                  </div>
                )}
              </>
            )}
            <Grid className="grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
              {(recipes || []).map((recipe) => {
                return (
                  <Fragment key={recipe.id}>
                    <RecipeCard recipe={recipe} cookbookId={cookbookId ? +cookbookId : undefined} />
                  </Fragment>
                );
              })}
            </Grid>
            {recipes.length > 0 && <Pager dataTestId={DataTestId.DashboardPage.PAGER} page={filters.page_number} onPage={onPageChange} hasNextPage={!!recipeData?.has_next_page} />}
          </Stack>
        </LoadingGroup>
      </div>
    </SidebarProvider>
  );
};
