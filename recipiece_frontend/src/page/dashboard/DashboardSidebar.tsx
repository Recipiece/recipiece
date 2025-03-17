import { DataTestId } from "@recipiece/constant";
import { CookbookSchema, UserKitchenMembershipSchema } from "@recipiece/types";
import { FC, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useGetSelfQuery, useListCookbooksQuery, useListUserKitchenMembershipsQuery } from "../../api";
import {
  LoadingGroup,
  MembershipAvatar,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "../../component";
import { useLayout } from "../../hooks";

export interface DashboardSidebarProps {
  readonly onMembershipSelected: (membership: UserKitchenMembershipSchema) => void;
  readonly onCookbookSelected: (cookbook: CookbookSchema) => void;
  readonly onAllSelected: () => void;
  readonly onOwnedSelected: () => void;
}

export const DashboardSidebar: FC = () => {
  const navigate = useNavigate();
  const { open, setOpenMobile } = useSidebar();
  const { isMobile } = useLayout();

  const { data: cookbooks, isLoading: isLoadingCookbooks } = useListCookbooksQuery({
    page_number: 0,
  });

  const { data: memberships, isLoading: isLoadingMemberships } = useListUserKitchenMembershipsQuery({
    targeting_self: true,
    from_self: true,
    status: ["accepted"],
    page_number: 0,
  });

  const { data: user, isLoading: isLoadingUser } = useGetSelfQuery();

  const onNavigate = useCallback(
    (dest: string) => {
      if (isMobile) {
        setOpenMobile(false);
      }
      navigate(dest);
    },
    [isMobile, navigate, setOpenMobile]
  );

  return (
    <Sidebar className="mt-16 h-[calc(100%-64px)]" collapsible="icon">
      <SidebarContent data-testid={DataTestId.DashboardSidebar.SIDEBAR_CONTENT} className="pt-16 md:pt-8 lg:pt-0">
        <SidebarGroup className="hidden sm:block">
          <SidebarTrigger data-testid={DataTestId.DashboardSidebar.SIDEBAR_TRIGGER_DESKTOP} />
        </SidebarGroup>
        {open && (
          <SidebarGroup data-testid={DataTestId.DashboardSidebar.SIDEBAR_GROUP_KITCHENS}>
            <SidebarGroupLabel>Kitchens</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <LoadingGroup isLoading={isLoadingMemberships || isLoadingUser} variant="spinner" className="w-6 h-6">
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      data-testid={DataTestId.DashboardSidebar.SIDEBAR_BUTTON_YOUR_RECIPES}
                      className="h-auto cursor-pointer"
                      isActive={location.pathname.endsWith("/dashboard")}
                      onClick={() => onNavigate("/dashboard")}
                    >
                      Your Recipes
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      data-testid={DataTestId.DashboardSidebar.SIDEBAR_BUTTON_ALL_RECIPES}
                      className="h-auto cursor-pointer"
                      isActive={location.pathname.endsWith("/dashboard/all")}
                      onClick={() => onNavigate("/dashboard/all")}
                    >
                      All Recipes
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  {(memberships?.data ?? []).map((membership) => {
                    return (
                      <SidebarMenuItem key={membership.id}>
                        <SidebarMenuButton
                          data-testid={DataTestId.DashboardSidebar.SIDEBAR_BUTTON_MEMBERSHIP(membership.id)}
                          className="h-auto cursor-pointer"
                          isActive={location.pathname.endsWith(`/kitchen/${membership.id}`)}
                          onClick={() => onNavigate(`/kitchen/${membership.id}`)}
                        >
                          {membership.source_user.id === user?.id && membership.destination_user.username}
                          {membership.destination_user.id === user?.id && membership.source_user.username}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </LoadingGroup>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
        {open && (
          <SidebarGroup data-testid={DataTestId.DashboardSidebar.SIDEBAR_GROUP_COOKBOOKS}>
            <SidebarGroupLabel>Cookbooks</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <LoadingGroup isLoading={isLoadingCookbooks} variant="spinner" className="w-6 h-6">
                  {(cookbooks?.data ?? []).map((cookbook) => {
                    return (
                      <SidebarMenuItem key={cookbook.id}>
                        <SidebarMenuButton
                          data-testid={DataTestId.DashboardSidebar.SIDEBAR_BUTTON_COOKBOOK(cookbook.id)}
                          className="h-auto cursor-pointer"
                          isActive={location.pathname.endsWith(`/cookbook/${cookbook.id}`)}
                          asChild
                          onClick={() => onNavigate(`/cookbook/${cookbook.id}`)}
                        >
                          <div className="flex flex-row gap-2">
                            <MembershipAvatar entity={cookbook} size="small" membershipId={cookbook.user_kitchen_membership_id} />
                            <span>{cookbook.name}</span>
                          </div>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </LoadingGroup>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
};
