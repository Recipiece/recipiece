import { CookbookSchema, UserKitchenMembershipSchema } from "@recipiece/types";
import { FC, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useListCookbooksQuery, useListUserKitchenMembershipsQuery } from "../../api";
import {
  LoadingGroup,
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
    page_number: 0,
  });

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
      <SidebarContent className="pt-16 md:pt-8 lg:pt-0">
        <SidebarGroup className="hidden sm:block">
          <SidebarTrigger />
        </SidebarGroup>
        {open && (
          <SidebarGroup>
            <SidebarGroupLabel>Kitchens</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <LoadingGroup isLoading={isLoadingMemberships} variant="spinner" className="w-6 h-6">
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      className="h-auto cursor-pointer"
                      isActive={location.pathname.endsWith("/dashboard")}
                      onClick={() => onNavigate("/dashboard")}
                    >
                      Your Recipes
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
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
                          className="h-auto cursor-pointer"
                          isActive={location.pathname.endsWith(`/kitchen/${membership.id}`)}
                          onClick={() => onNavigate(`/kitchen/${membership.id}`)}
                        >
                          {membership.source_user.username}
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
          <SidebarGroup>
            <SidebarGroupLabel>Cookbooks</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <LoadingGroup isLoading={isLoadingCookbooks} variant="spinner" className="w-6 h-6">
                  {(cookbooks?.data ?? []).map((cookbook) => {
                    return (
                      <SidebarMenuItem key={cookbook.id}>
                        <SidebarMenuButton
                          className="h-auto cursor-pointer"
                          isActive={location.pathname.endsWith(`/cookbook/${cookbook.id}`)}
                          asChild
                          onClick={() => onNavigate(`/cookbook/${cookbook.id}`)}
                        >
                          <span>{cookbook.name}</span>
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
