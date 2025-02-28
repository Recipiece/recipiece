import { Page, expect, test as base } from "@playwright/test";
import { DataTestId } from "@recipiece/constant";
import { User } from "@recipiece/database";

export const loginUser = async (user: User, page: Page) => {
  await page.goto("/login");
  await page.getByTestId(DataTestId.LoginPage.INPUT_USERNAME).fill(user.username);
  await page.getByTestId(DataTestId.LoginPage.INPUT_PASSWORD).fill("password");
  await page.getByTestId(DataTestId.LoginPage.BUTTON_LOGIN).click();

  await page.waitForLoadState("networkidle");
  await expect(page).toHaveURL("http://127.0.0.1:3001/dashboard");
};

// export const loginFixture = (testBase?: typeof base) => {
//   const trueBase = testBase ?? base;
//   return trueBase.extend<{
//     readonly loginFixture: {
//       readonly login: (user: User, page: Page) => Promise<void>;
//     };
//   }>(async (_, use) => {
//     await use({
//       loginUser: loginUser,
//     });
//   });
// };
