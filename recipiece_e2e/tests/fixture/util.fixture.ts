import { expect, Page } from "@playwright/test";
import { DataTestId } from "@recipiece/constant";

/**
 * A fixture for managing the sidebar.
 * On desktop it's a little hacky, we just wait till the create cookbook button is/isn't visible
 */

export const summonDashboardSidebar = async (page: Page, isMobile: boolean) => {
  let isSidebarOpen: boolean;
  if(isMobile) {
    isSidebarOpen = await page.getByTestId(DataTestId.DashboardSidebar.SIDEBAR_CONTENT).isVisible();
  } else {
    isSidebarOpen = await page.getByTestId(DataTestId.DashboardSidebar.SIDEBAR_BUTTON_CREATE_COOKBOOK).isVisible();
  }

  if(!isSidebarOpen && isMobile) {
    await page.getByTestId(DataTestId.DashboardSidebar.SIDEBAR_TRIGGER_MOBILE).click();
    await expect(page.getByTestId(DataTestId.DashboardSidebar.SIDEBAR_CONTENT)).toBeVisible();
  } else if (!isSidebarOpen && !isMobile) {
    await page.getByTestId(DataTestId.DashboardSidebar.SIDEBAR_TRIGGER_DESKTOP).click();
    await expect(page.getByTestId(DataTestId.DashboardSidebar.SIDEBAR_BUTTON_CREATE_COOKBOOK)).toBeVisible();
  }
}

export const dismissDashboardSidebar = async (page: Page, isMobile: boolean) => {
  let isSidebarOpen: boolean;
  if(isMobile) {
    isSidebarOpen = await page.getByTestId(DataTestId.DashboardSidebar.SIDEBAR_CONTENT).isVisible();
  } else {
    isSidebarOpen = await page.getByTestId(DataTestId.DashboardSidebar.SIDEBAR_BUTTON_CREATE_COOKBOOK).isVisible();
  }

  if (isSidebarOpen && isMobile) {
    // just click anywhere outside the sidebar, like the top right corner
    const body = page.locator("body");
    const box = await body.boundingBox();
    await body.click({
      position: {
        x: box.x + box.width - 20,
        y: 20,
      },
    });
    await expect(page.getByTestId(DataTestId.DashboardSidebar.SIDEBAR_CONTENT)).not.toBeVisible();
  } else if (isSidebarOpen && !isMobile) {
    // there's a button for dismissal on desktop
    await page.getByTestId(DataTestId.DashboardSidebar.SIDEBAR_TRIGGER_DESKTOP).click();
    await expect(page.getByTestId(DataTestId.DashboardSidebar.SIDEBAR_BUTTON_CREATE_COOKBOOK)).not.toBeVisible();
  }
};
