import { expect, test } from "@playwright/test";
import { DataTestId } from "@recipiece/constant";
import { generateUserWithPassword } from "@recipiece/test";

test.describe("Login Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL("http://127.0.0.1:3001/login");
  });

  test("should not login a user who does not exist", async ({ page }) => {
    await page.getByTestId(DataTestId.LoginPage.INPUT_USERNAME).fill("nonsense");
    await page.getByTestId(DataTestId.LoginPage.INPUT_PASSWORD).fill("password");
    await page.getByTestId(DataTestId.LoginPage.BUTTON_LOGIN).click();

    await page.getByTestId(DataTestId.LoginPage.TOAST_LOGIN_FAILED).waitFor({
      state: "visible",
      timeout: 3000,
    });

    await expect(page).toHaveURL("http://127.0.0.1:3001/login");
  });

  test("should login a user by username", async ({ page }) => {
    const password = "p@ssword!";
    const [user] = await generateUserWithPassword(password);

    await page.getByTestId(DataTestId.LoginPage.INPUT_USERNAME).fill(user.username);
    await page.getByTestId(DataTestId.LoginPage.INPUT_PASSWORD).fill(password);
    await page.getByTestId(DataTestId.LoginPage.BUTTON_LOGIN).click();

    await page.waitForLoadState("networkidle");

    await expect(page).toHaveURL("http://127.0.0.1:3001/dashboard");
  });

  test("should login a use by email", async ({ page }) => {
    const password = "p@ssword!";
    const [user] = await generateUserWithPassword(password);

    await page.getByTestId(DataTestId.LoginPage.INPUT_USERNAME).fill(user.username);
    await page.getByTestId(DataTestId.LoginPage.INPUT_PASSWORD).fill(password);
    await page.getByTestId(DataTestId.LoginPage.BUTTON_LOGIN).click();

    await page.waitForLoadState("networkidle");

    await expect(page).toHaveURL("http://127.0.0.1:3001/dashboard");
  });

  test("should allow users to go to the register page", async ({ page }) => {
    await page.getByTestId(DataTestId.LoginPage.BUTTON_REGISTER).click();

    await page.waitForLoadState("networkidle");

    await expect(page).toHaveURL("http://127.0.0.1:3001/create-account");
  });

  test("should allow users to go to the forgot password page", async ({ page }) => {
    await page.getByTestId(DataTestId.LoginPage.BUTTON_FORGOT_PASSWORD).click();

    await page.waitForLoadState("networkidle");

    await expect(page).toHaveURL("http://127.0.0.1:3001/forgot-password");
  });

  test("should remember the user if the remember me checkbox is checked", async ({ page }) => {
    const password = "p@ssword!";
    const [user] = await generateUserWithPassword(password);

    await page.getByTestId(DataTestId.LoginPage.INPUT_USERNAME).fill(user.username);
    await page.getByTestId(DataTestId.LoginPage.INPUT_PASSWORD).fill(password);
    await page.getByTestId(DataTestId.LoginPage.CHECKBOX_REMEMBER_ME).click();
    await page.getByTestId(DataTestId.LoginPage.BUTTON_LOGIN).click();

    await page.waitForLoadState("networkidle");

    await expect(page).toHaveURL("http://127.0.0.1:3001/dashboard");

    const sessionStorage = await page.evaluate(() => sessionStorage);
    const localStorage = await page.evaluate(() => localStorage);

    const bearerToken = sessionStorage["recipiece/access_token"];
    expect(bearerToken).toBeTruthy();

    const refreshToken = localStorage["recipiece/refresh_token"];
    expect(refreshToken).toBeTruthy();
  });

  test("should not remember a session if the remember me checkbox is not checked", async ({ page }) => {
    const password = "p@ssword!";
    const [user] = await generateUserWithPassword(password);

    await page.getByTestId(DataTestId.LoginPage.INPUT_USERNAME).fill(user.username);
    await page.getByTestId(DataTestId.LoginPage.INPUT_PASSWORD).fill(password);
    await page.getByTestId(DataTestId.LoginPage.BUTTON_LOGIN).click();

    await page.waitForLoadState("networkidle");

    await expect(page).toHaveURL("http://127.0.0.1:3001/dashboard");

    const sessionStorage = await page.evaluate(() => sessionStorage);
    const localStorage = await page.evaluate(() => localStorage);

    const bearerToken = sessionStorage["recipiece/access_token"];
    expect(bearerToken).toBeTruthy();

    expect(sessionStorage["recipiece/refresh_token"]).toBeTruthy();
    expect(localStorage["recipiece/refresh_token"]).toBeFalsy();
  });

  test("should redirect the user to the dashboard if they hit the page with a valid session", async ({ page }) => {
    const password = "p@ssword!";
    const [user] = await generateUserWithPassword(password);

    await page.getByTestId(DataTestId.LoginPage.INPUT_USERNAME).fill(user.email);
    await page.getByTestId(DataTestId.LoginPage.INPUT_PASSWORD).fill(password);
    await page.getByTestId(DataTestId.LoginPage.BUTTON_LOGIN).click();

    await page.waitForLoadState("networkidle");

    await expect(page).toHaveURL("http://127.0.0.1:3001/dashboard");
    await page.goto("/login");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL("http://127.0.0.1:3001/dashboard");
  });
});
