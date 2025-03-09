import { FC, useCallback, useContext, useEffect } from "react";
import { createPortal } from "react-dom";
import { useParams, useSearchParams } from "react-router-dom";
import { useGetUserKitchenMembershipQuery, useUpdateKitchenMembershipMutation } from "../../api";
import {
  H2,
  LoadingGroup,
  NotFound,
  RecipieceMenuBarContext,
  Stack,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  useToast,
} from "../../component";
import { DialogContext } from "../../context";
import { EditMembershipForm } from "../../dialog";
import { useLayout } from "../../hooks";
import { CookbookSharesTable } from "./CookbookSharesTable";
import { KitchenMembershipContextMenu } from "./KitchenMembershipContextMenu";
import { MealPlanSharesTable } from "./MealPlanSharesTable";
import { RecipeSharesTable } from "./RecipeSharesTable";
import { ShoppingListSharesTable } from "./ShoppingListSharesTable";

const TAB_RECIPES = "recipes";
const TAB_MEAL_PLANS = "meal_plans";
const TAB_SHOPPING_LISTS = "shopping_lists";
const TAB_COOKBOOKS = "cookbooks";

export const KitchenMembershipPage: FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { kitchenMembershipId } = useParams();
  const entityId = +kitchenMembershipId!;

  const { pushDialog, popDialog } = useContext(DialogContext);
  const { isMobile } = useLayout();
  const { mobileMenuPortalRef } = useContext(RecipieceMenuBarContext);

  const { toast } = useToast();

  const {
    data: membership,
    isLoading: isLoadingMembership,
    isError: isMembershipError,
  } = useGetUserKitchenMembershipQuery(entityId);

  const { mutateAsync: updateMembership } = useUpdateKitchenMembershipMutation();

  useEffect(() => {
    if (!searchParams.get("tab")) {
      setSearchParams({
        tab: TAB_RECIPES,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onTabChange = useCallback(
    (tabId: string) => {
      setSearchParams((prev) => {
        return {
          ...prev,
          tab: tabId,
        };
      });
    },
    [setSearchParams]
  );

  const onMembershipEdited = useCallback(() => {
    pushDialog("editMembership", {
      userKitchenMembership: membership!,
      onClose: () => popDialog("editMembership"),
      onSubmit: async (formData: EditMembershipForm) => {
        try {
          console.log(formData);
          await updateMembership({
            id: membership!.id,
            grant_level: formData.grant_level as "ALL" | "SELECTIVE",
          });
          toast({
            title: "Membership Changed",
            description: `Sharing level with ${membership?.destination_user.username} has been changed`,
          });
        } catch {
          toast({
            title: "Unable to Change Membership",
            description: `You level of sharing with ${membership?.destination_user.username} could not be changed. Try again later`,
          });
        } finally {
          popDialog("editMembership");
        }
      },
    });
  }, [membership, popDialog, pushDialog, toast, updateMembership]);

  return (
    <LoadingGroup isLoading={isLoadingMembership} variant="skeleton" className="h-10 w-full">
      {membership && (
        <Stack>
          <div className="flex flex-row gap-2">
            <H2 className="flex-grow">Shared with {membership.destination_user.username}</H2>
            {isMobile &&
              mobileMenuPortalRef &&
              mobileMenuPortalRef.current &&
              createPortal(
                <KitchenMembershipContextMenu membership={membership} onEdit={onMembershipEdited} />,
                mobileMenuPortalRef.current
              )}
            {!isMobile && <>{<KitchenMembershipContextMenu membership={membership} onEdit={onMembershipEdited} />}</>}
          </div>

          <p className="text-sm text-center">
            {membership.grant_level === "SELECTIVE" && (
              <>Below are all of the things you&apos;ve shared with {membership.destination_user.username}.</>
            )}
            {membership.grant_level === "ALL" && <>You&apos;re sharing everything with this user.</>}
          </p>
          {membership.grant_level === "SELECTIVE" && (
            <Tabs defaultValue={searchParams.get("tab") ?? TAB_RECIPES} onValueChange={onTabChange}>
              <TabsList className="items-left w-full justify-start">
                <TabsTrigger value={TAB_RECIPES}>Recipes</TabsTrigger>
                <TabsTrigger value={TAB_COOKBOOKS}>Cookbooks</TabsTrigger>
                <TabsTrigger value={TAB_MEAL_PLANS}>Meal Plans</TabsTrigger>
                <TabsTrigger value={TAB_SHOPPING_LISTS}>Shopping Lists</TabsTrigger>
              </TabsList>

              <TabsContent value={TAB_RECIPES} className="pl-4 pr-4">
                <RecipeSharesTable membership={membership} />
              </TabsContent>
              <TabsContent value={TAB_COOKBOOKS} className="pl-4 pr-4">
                <CookbookSharesTable membership={membership} />
              </TabsContent>
              <TabsContent value={TAB_MEAL_PLANS} className="pl-4 pr-4">
                <MealPlanSharesTable membership={membership} />
              </TabsContent>
              <TabsContent value={TAB_SHOPPING_LISTS} className="pl-4 pr-4">
                <ShoppingListSharesTable membership={membership} />
              </TabsContent>
            </Tabs>
          )}
        </Stack>
      )}
      {isMembershipError && <NotFound backNav="/dashboard" />}
    </LoadingGroup>
  );
};
