import { expect, Page } from "@playwright/test";
import { DataTestId } from "@recipiece/constant";

export const dismissDashboardSidebar = async (page: Page, isMobile: boolean) => {
  const isSidebarOpen = await page.getByTestId(DataTestId.DashboardSidebar.SIDEBAR_CONTENT).isVisible();
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
    await expect(page.getByTestId(DataTestId.DashboardSidebar.SIDEBAR_CONTENT)).not.toBeVisible();
  }
};
