import { FC, useCallback, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useGetSelfQuery, useGetUserKitchenMembershipQuery } from "../../api";
import { H2, LoadingGroup, NotFound, Tabs, TabsContent, TabsList, TabsTrigger } from "../../component";
import { MealPlanTab } from "./MealPlanTab";

const TAB_SHOPPING_LISTS = "shopping-lists";
const TAB_MEAL_PLANS = "tab-meal-plans";

export const MembershipViewPage: FC = () => {
  const { membershipId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const {
    data: membership,
    isLoading: isLoadingMembership,
    isError: isMembershipError,
  } = useGetUserKitchenMembershipQuery(+membershipId!);

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
    <div className="flex flex-col">
      <LoadingGroup variant="skeleton" className="h-[49px] w-full" isLoading={isLoadingMembership || isLoadingUser}>
        <H2>{title ?? ""}</H2>
      </LoadingGroup>
      <Tabs defaultValue={searchParams.get("tab") ?? TAB_MEAL_PLANS} onValueChange={onTabChange}>
        <TabsList>
          <TabsTrigger value={TAB_MEAL_PLANS}>Meal Plans</TabsTrigger>
          <TabsTrigger value={TAB_SHOPPING_LISTS}>Shopping Lists</TabsTrigger>
        </TabsList>
        <TabsContent value={TAB_MEAL_PLANS}>
          {!isMembershipError && <MealPlanTab userKitchenMembershipId={+membershipId!} />}
          {isMembershipError && <NotFound backNav="Go Home" />}
        </TabsContent>
        <TabsContent value={TAB_SHOPPING_LISTS}>{isMembershipError && <NotFound backNav="Go Home" />}</TabsContent>
      </Tabs>
    </div>
  );
};
