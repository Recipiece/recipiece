import { expect, test } from "@playwright/test";
import { Seed } from "../../util";
import { DataTestID } from "@recipiece/constant";

test.describe("Login Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL("http://127.0.0.1:3000/login");
  });

  test("should not login a user who does not exist", async ({ page }) => {
    await page.getByTestId(DataTestID.LoginPage.INPUT_USERNAME).fill("nonsense");
    await page.getByTestId(DataTestID.LoginPage.INPUT_PASSWORD).fill("password");
    await page.getByTestId(DataTestID.LoginPage.BUTTON_LOGIN).click();

    await page.getByTestId(DataTestID.LoginPage.TOAST_LOGIN_FAILED).waitFor({
      state: "visible",
      timeout: 3000,
    });

    await expect(page).toHaveURL("http://127.0.0.1:3000/login");
  });

  test("should login a user by username", async ({ page }) => {
    await page.getByTestId(DataTestID.LoginPage.INPUT_USERNAME).fill(Seed.PLAYWRIGHT_USER_USERNAME);
    await page.getByTestId(DataTestID.LoginPage.INPUT_PASSWORD).fill(Seed.PLAYWRIGHT_USER_PASSWORD);
    await page.getByTestId(DataTestID.LoginPage.BUTTON_LOGIN).click();

    await page.waitForLoadState("networkidle");

    await expect(page).toHaveURL("http://127.0.0.1:3000/dashboard");
  });

  test("should login a use by email", async ({ page }) => {
    await page.getByTestId(DataTestID.LoginPage.INPUT_USERNAME).fill(Seed.PLAYWRIGHT_USER_EMAIL);
    await page.getByTestId(DataTestID.LoginPage.INPUT_PASSWORD).fill(Seed.PLAYWRIGHT_USER_PASSWORD);
    await page.getByTestId(DataTestID.LoginPage.BUTTON_LOGIN).click();

    await page.waitForLoadState("networkidle");

    await expect(page).toHaveURL("http://127.0.0.1:3000/dashboard");
  });

  test("should allow users to go to the register page", async ({ page }) => {
    await page.getByTestId(DataTestID.LoginPage.BUTTON_REGISTER).click();

    await page.waitForLoadState("networkidle");

    await expect(page).toHaveURL("http://127.0.0.1:3000/create-account");
  });

  test("should allow users to go to the forgot password page", async ({ page }) => {
    await page.getByTestId(DataTestID.LoginPage.BUTTON_FORGOT_PASSWORD).click();

    await page.waitForLoadState("networkidle");

    await expect(page).toHaveURL("http://127.0.0.1:3000/forgot-password");
  });

  test("should remember the user if the remember me checkbox is checked", async ({ page }) => {
    await page.getByTestId(DataTestID.LoginPage.INPUT_USERNAME).fill(Seed.PLAYWRIGHT_USER_EMAIL);
    await page.getByTestId(DataTestID.LoginPage.INPUT_PASSWORD).fill(Seed.PLAYWRIGHT_USER_PASSWORD);
    await page.getByTestId(DataTestID.LoginPage.CHECKBOX_REMEMBER_ME).click();
    await page.getByTestId(DataTestID.LoginPage.BUTTON_LOGIN).click();

    await page.waitForLoadState("networkidle");

    await expect(page).toHaveURL("http://127.0.0.1:3000/dashboard");

    const sessionStorage = await page.evaluate(() => sessionStorage);
    const localStorage = await page.evaluate(() => localStorage);

    const bearerToken = sessionStorage["recipiece/access_token"];
    expect(bearerToken).toBeTruthy();

    const refreshToken = localStorage["recipiece/refresh_token"];
    expect(refreshToken).toBeTruthy();
  });

  test("should not remember a session if the remember me checkbox is not checked", async ({page}) => {
    await page.getByTestId(DataTestID.LoginPage.INPUT_USERNAME).fill(Seed.PLAYWRIGHT_USER_EMAIL);
    await page.getByTestId(DataTestID.LoginPage.INPUT_PASSWORD).fill(Seed.PLAYWRIGHT_USER_PASSWORD);
    await page.getByTestId(DataTestID.LoginPage.BUTTON_LOGIN).click();

    await page.waitForLoadState("networkidle");

    await expect(page).toHaveURL("http://127.0.0.1:3000/dashboard");

    const sessionStorage = await page.evaluate(() => sessionStorage);
    const localStorage = await page.evaluate(() => localStorage);

    const bearerToken = sessionStorage["recipiece/access_token"];
    expect(bearerToken).toBeTruthy();

    expect(sessionStorage["recipiece/refresh_token"]).toBeFalsy();
    expect(localStorage["recipiece/refresh_token"]).toBeFalsy();
  });

  test("should redirect the user to the dashboard if they hit the page with a valid session", async ({page}) => {
    await page.getByTestId(DataTestID.LoginPage.INPUT_USERNAME).fill(Seed.PLAYWRIGHT_USER_EMAIL);
    await page.getByTestId(DataTestID.LoginPage.INPUT_PASSWORD).fill(Seed.PLAYWRIGHT_USER_PASSWORD);
    await page.getByTestId(DataTestID.LoginPage.BUTTON_LOGIN).click();

    await page.waitForLoadState("networkidle");

    await expect(page).toHaveURL("http://127.0.0.1:3000/dashboard");
    await page.goto("/login");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL("http://127.0.0.1:3000/dashboard");
  });
});
