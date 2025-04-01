import { expect, test } from "@playwright/test";
import { DataTestId } from "@recipiece/constant";
import { emailGenerator, usernameGenerator } from "@recipiece/test";

/**
 * Test account creation
 * 1. Start on login page
 * 2. Nav to create account
 * 3. Enter in an email and username and password
 * 4. Login with newly created credentials
 */
test("Create Account Story", async ({ page }) => {
  const username = usernameGenerator.next().value;
  const email = emailGenerator.next().value;
  const password = "p@ssword!";

  await page.goto("/login");
  await page.getByTestId(DataTestId.LoginPage.BUTTON_REGISTER).click();
  await expect(page).toHaveURL("http://127.0.0.1:3001/create-account");

  await page.getByTestId(DataTestId.RegisterPage.INPUT_EMAIL).fill(email);
  await page.getByTestId(DataTestId.RegisterPage.INPUT_USERNAME).fill(username);
  await page.getByTestId(DataTestId.RegisterPage.INPUT_PASSWORD).fill(password);
  await page.getByTestId(DataTestId.RegisterPage.INPUT_CONFIRM_PASSWORD).fill(password);
  await page.getByTestId(DataTestId.RegisterPage.BUTTON_CREATE_ACCOUNT).click();

  await page.waitForLoadState("networkidle");
  await expect(page).toHaveURL("http://127.0.0.1:3001/login");

  await page.getByTestId(DataTestId.LoginPage.INPUT_USERNAME).fill(username);
  await page.getByTestId(DataTestId.LoginPage.INPUT_PASSWORD).fill(password);
  await page.getByTestId(DataTestId.LoginPage.BUTTON_LOGIN).click();

  await page.waitForLoadState("networkidle");
  await expect(page).toHaveURL("http://127.0.0.1:3001/dashboard");
});
