import { Page, expect, test as base } from "@playwright/test";
import { DataTestId } from "@recipiece/constant";
import { User } from "@recipiece/database";

export const loginUser = async (user: User, page: Page, password = "password") => {
  await page.goto("/login");
  await page.getByTestId(DataTestId.LoginPage.INPUT_USERNAME).fill(user.username);
  await page.getByTestId(DataTestId.LoginPage.INPUT_PASSWORD).fill(password);
  await page.getByTestId(DataTestId.LoginPage.BUTTON_LOGIN).click();
  await expect(page).toHaveURL("http://127.0.0.1:3001/dashboard");
};

export const logoutUser = async (page: Page, isMobile: boolean) => {
  if (isMobile) {
    const accountMenuItem = page.getByTestId(DataTestId.MenuBar.MENU_TRIGGER_ACCOUNT_MOBILE);
    await accountMenuItem.click();
  } else {
    const accountMenuItem = page.getByTestId(DataTestId.MenuBar.MENU_TRIGGER_ACCOUNT_DESKTOP);
    await accountMenuItem.click();
  }
  await page.getByTestId(DataTestId.MenuBar.MENU_ITEM_SIGN_OUT).click();
  await expect(page).toHaveURL("http://127.0.0.1:3001/login");
}
