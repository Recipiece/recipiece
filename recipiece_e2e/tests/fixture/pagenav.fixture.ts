import { expect, Page } from "@playwright/test";
import { DataTestId } from "@recipiece/constant";

export class AuthenticatedNav {
  public static readonly toDashboard = async (page: Page, isMobile: boolean) => {
    if (isMobile) {
      await page.getByTestId(DataTestId.MenuBar.MENU_ITEM_HOME_MOBILE).click();
    } else {
      await page.getByTestId(DataTestId.MenuBar.MENU_ITEM_HOME_DESKTOP).click();
    }

    await expect(page).toHaveURL("http://127.0.0.1:3001/dashboard");
  };

  public static readonly toMembershipsPage = async (page: Page, isMobile: boolean) => {
    if (isMobile) {
      const accountMenuItem = page.getByTestId(DataTestId.MenuBar.MENU_TRIGGER_ACCOUNT_MOBILE);
      await accountMenuItem.click();
    } else {
      const accountMenuItem = page.getByTestId(DataTestId.MenuBar.MENU_TRIGGER_ACCOUNT_DESKTOP);
      await accountMenuItem.click();
    }

    const goToMembershipsMenuItem = page.getByTestId(DataTestId.MenuBar.MENU_ITEM_GOTO_MEMBERSHIPS);
    await goToMembershipsMenuItem.click();
    await expect(page).toHaveURL("http://127.0.0.1:3001/memberships");
    await expect(page.getByTestId(DataTestId.MenuBar.DROPDOWN_MENU_ACCOUNT_MOBILE)).not.toBeVisible();
  };

  public static readonly toKitchen = async (membershipId: "all" | "user" | number, page: Page, isMobile: boolean) => {
    if (page.url() !== "http://127.0.0.1:3001/dashboard") {
      await AuthenticatedNav.toDashboard(page, isMobile);
    }

    if (isMobile) {
      await page.getByTestId(DataTestId.DashboardSidebar.SIDEBAR_TRIGGER_MOBILE).click();
      await expect(page.getByTestId(DataTestId.DashboardSidebar.SIDEBAR_CONTENT)).toBeVisible()
    }

    if (membershipId === "all") {
      await page.getByTestId(DataTestId.DashboardSidebar.SIDEBAR_BUTTON_ALL_RECIPES).click();
      await expect(page).toHaveURL("http://127.0.0.1:3001/dashboard/all");
    } else if (membershipId === "user") {
      await page.getByTestId(DataTestId.DashboardSidebar.SIDEBAR_BUTTON_YOUR_RECIPES).click();
      await expect(page).toHaveURL("http://127.0.0.1:3001/dashboard");
    } else {
      await page.getByTestId(DataTestId.DashboardSidebar.SIDEBAR_BUTTON_MEMBERSHIP(membershipId)).click();
      await expect(page).toHaveURL(`http://127.0.0.1:3001/kitchen/${membershipId}`);
    }

    if(isMobile) {
      await expect(page.getByTestId(DataTestId.DashboardSidebar.SIDEBAR_CONTENT)).not.toBeVisible()
    }
  };

  public static readonly toCookbook = async (cookbookId: number, page: Page, isMobile: boolean) => {
    if (page.url() !== "http://127.0.0.1:3001/dashboard") {
      await AuthenticatedNav.toDashboard(page, isMobile);
    }

    if (isMobile) {
      await page.getByTestId(DataTestId.DashboardSidebar.SIDEBAR_TRIGGER_MOBILE).click();
    }

    await page.getByTestId(DataTestId.DashboardSidebar.SIDEBAR_BUTTON_COOKBOOK(cookbookId)).click();
    await expect(page).toHaveURL(`http://l127.0.0.1:3001/cookbook/${cookbookId}`);

    if(isMobile) {
      await expect(page.getByTestId(DataTestId.DashboardSidebar.SIDEBAR_CONTENT)).not.toBeVisible()
    }
  };
}
