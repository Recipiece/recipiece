import { FC, useCallback, useContext, useEffect } from "react";
import { createPortal } from "react-dom";
import { useParams, useSearchParams } from "react-router-dom";
import { useGetSelfQuery, useGetUserKitchenMembershipQuery } from "../../api";
import { H2, LoadingGroup, NotFound, RecipieceMenuBarContext, Tabs, TabsContent, TabsList, TabsTrigger } from "../../component";
import { useLayout } from "../../hooks";
import { MealPlanTab } from "./MealPlanTab";
import { MembershipContextMenu } from "./MembershipContextMenu";
import { ShoppingListTab } from "./ShoppingListTab";

const TAB_SHOPPING_LISTS = "shopping-lists";
const TAB_MEAL_PLANS = "meal-plans";

export const MembershipViewPage: FC = () => {
  const { membershipId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { mobileMenuPortalRef } = useContext(RecipieceMenuBarContext);
  const { isMobile } = useLayout();

  const { data: membership, isLoading: isLoadingMembership, isError: isMembershipError } = useGetUserKitchenMembershipQuery(+membershipId!);

  const { data: user, isLoading: isLoadingUser } = useGetSelfQuery();

  const isUserSourceUser = membership?.source_user.id === user?.id;
  const title = isUserSourceUser ? membership?.destination_user.username : membership?.source_user.username;

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

  useEffect(() => {
    if (!searchParams.get("tab")) {
      setSearchParams({
        tab: TAB_MEAL_PLANS,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col gap-2">
      <LoadingGroup variant="skeleton" className="h-[49px] w-full" isLoading={isLoadingMembership || isLoadingUser}>
        <div className="flex flex-row gap-2">
          <H2 className="flex-grow">{title ?? ""}</H2>
          {isMobile && mobileMenuPortalRef && mobileMenuPortalRef.current && createPortal(<MembershipContextMenu membership={membership!} />, mobileMenuPortalRef.current)}
          {!isMobile && <>{<MembershipContextMenu membership={membership!} />}</>}
        </div>
        <span className="text-xs">Recipes and Cookbooks are shared by default. Manage your meal plans and shopping lists shared with this user.</span>
      </LoadingGroup>
      <Tabs defaultValue={searchParams.get("tab") ?? TAB_MEAL_PLANS} onValueChange={onTabChange}>
        <TabsList className="w-full justify-start">
          <TabsTrigger value={TAB_MEAL_PLANS}>Meal Plans</TabsTrigger>
          <TabsTrigger value={TAB_SHOPPING_LISTS}>Shopping Lists</TabsTrigger>
        </TabsList>
        <TabsContent value={TAB_MEAL_PLANS}>
          {!isMembershipError && <MealPlanTab userKitchenMembershipId={+membershipId!} />}
          {isMembershipError && <NotFound backNav="Go Home" />}
        </TabsContent>
        <TabsContent value={TAB_SHOPPING_LISTS}>
          {!isMembershipError && <ShoppingListTab userKitchenMembershipId={+membershipId!} />}
          {isMembershipError && <NotFound backNav="Go Home" />}
        </TabsContent>
      </Tabs>
    </div>
  );
};
