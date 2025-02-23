import { expect, test } from "@playwright/test";
import { DataTestId } from "@recipiece/constant";
import { emailGenerator, generateUser, usernameGenerator } from "@recipiece/test";

test.describe("Register Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/create-account");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL("http://127.0.0.1:3001/create-account");
  });

  test("should allow a user to register", async ({ page }) => {
    const newUserUsername = usernameGenerator.next().value;
    const newUserEmail = emailGenerator.next().value;
    const newUserPassword = "passwr0d";

    await page.getByTestId(DataTestId.RegisterPage.INPUT_USERNAME).fill(newUserUsername);
    await page.getByTestId(DataTestId.RegisterPage.INPUT_EMAIL).fill(newUserEmail);
    await page.getByTestId(DataTestId.RegisterPage.INPUT_PASSWORD).fill(newUserPassword);
    await page.getByTestId(DataTestId.RegisterPage.INPUT_CONFIRM_PASSWORD).fill(newUserPassword);

    await page.getByTestId(DataTestId.RegisterPage.BUTTON_CREATE_ACCOUNT).click();
    await page.waitForLoadState("networkidle");

    await page.getByTestId(DataTestId.RegisterPage.TOAST_SUCCESS).waitFor({
      state: "visible",
      timeout: 3000,
    });

    await expect(page).toHaveURL("http://127.0.0.1:3001/login");
  });

  test("should not allow a duplicate registration by username, case insensitive", async ({ page }) => {
    const existingUser = await generateUser();
    const newUserPassword = "passwr0d";

    await page.getByTestId(DataTestId.RegisterPage.INPUT_USERNAME).fill(existingUser.username.toUpperCase());
    await page.getByTestId(DataTestId.RegisterPage.INPUT_EMAIL).fill(`asdf-${existingUser.email}`);
    await page.getByTestId(DataTestId.RegisterPage.INPUT_PASSWORD).fill(newUserPassword);
    await page.getByTestId(DataTestId.RegisterPage.INPUT_CONFIRM_PASSWORD).fill(newUserPassword);

    await page.getByTestId(DataTestId.RegisterPage.BUTTON_CREATE_ACCOUNT).click();
    await page.waitForLoadState("networkidle");

    await page.getByTestId(DataTestId.RegisterPage.TOAST_FAILURE).waitFor({
      state: "visible",
      timeout: 3000,
    });
    await expect(page).toHaveURL("http://127.0.0.1:3001/create-account");
  });

  test("should not allow a duplicate registration by email, case insensitive", async ({ page }) => {
    const existingUser = await generateUser();
    const newUserPassword = "passwr0d";

    await page.getByTestId(DataTestId.RegisterPage.INPUT_USERNAME).fill(`asdf-${existingUser.username}`);
    await page.getByTestId(DataTestId.RegisterPage.INPUT_EMAIL).fill(existingUser.email.toUpperCase());
    await page.getByTestId(DataTestId.RegisterPage.INPUT_PASSWORD).fill(newUserPassword);
    await page.getByTestId(DataTestId.RegisterPage.INPUT_CONFIRM_PASSWORD).fill(newUserPassword);

    await page.getByTestId(DataTestId.RegisterPage.BUTTON_CREATE_ACCOUNT).click();
    await page.waitForLoadState("networkidle");

    await page.getByTestId(DataTestId.RegisterPage.TOAST_FAILURE).waitFor({
      state: "visible",
      timeout: 3000,
    });
    await expect(page).toHaveURL("http://127.0.0.1:3001/create-account");
  });

  test("should not allow an empty form", async ({ page }) => {
    await page.getByTestId(DataTestId.RegisterPage.BUTTON_CREATE_ACCOUNT).click();

    await expect(page).toHaveURL("http://127.0.0.1:3001/create-account");

    const usernameFormMessage = page.getByTestId(DataTestId.CommonForm.forMessage(DataTestId.RegisterPage.INPUT_USERNAME));
    await expect(usernameFormMessage).toBeVisible();

    const emailFormMessage = page.getByTestId(DataTestId.CommonForm.forMessage(DataTestId.RegisterPage.INPUT_EMAIL));
    await expect(emailFormMessage).toBeVisible();

    const passwordFormMessage = page.getByTestId(DataTestId.CommonForm.forMessage(DataTestId.RegisterPage.INPUT_PASSWORD));
    await expect(passwordFormMessage).toBeVisible();

    const confirmPasswordFormMessage = page.getByTestId(DataTestId.CommonForm.forMessage(DataTestId.RegisterPage.INPUT_CONFIRM_PASSWORD));
    await expect(confirmPasswordFormMessage).toBeVisible();
  });

  test("should not allow mismatched passwords", async ({ page }) => {
    const newUserUsername = "playwright-new";
    const newUserEmail = "playwright-new@recipiece.org";
    const newUserPassword = "passwr0d";

    await page.getByTestId(DataTestId.RegisterPage.INPUT_USERNAME).fill(newUserUsername);
    await page.getByTestId(DataTestId.RegisterPage.INPUT_EMAIL).fill(newUserEmail);
    await page.getByTestId(DataTestId.RegisterPage.INPUT_PASSWORD).fill(newUserPassword);
    await page.getByTestId(DataTestId.RegisterPage.INPUT_CONFIRM_PASSWORD).fill(`asdf${newUserPassword}`);

    await page.getByTestId(DataTestId.RegisterPage.BUTTON_CREATE_ACCOUNT).click();

    await expect(page).toHaveURL("http://127.0.0.1:3001/create-account");

    const confirmPasswordFormMessage = page.getByTestId(DataTestId.CommonForm.forMessage(DataTestId.RegisterPage.INPUT_CONFIRM_PASSWORD));
    await expect(confirmPasswordFormMessage).toBeVisible();
  });

  test("should not allow a username less than 5 characters", async ({ page }) => {
    const newUserEmail = "playwright-new@recipiece.org";
    const newUserPassword = "passwr0d";

    await page.getByTestId(DataTestId.RegisterPage.INPUT_USERNAME).fill("shrt");
    await page.getByTestId(DataTestId.RegisterPage.INPUT_EMAIL).fill(newUserEmail);
    await page.getByTestId(DataTestId.RegisterPage.INPUT_PASSWORD).fill(newUserPassword);
    await page.getByTestId(DataTestId.RegisterPage.INPUT_CONFIRM_PASSWORD).fill(newUserPassword);

    await page.getByTestId(DataTestId.RegisterPage.BUTTON_CREATE_ACCOUNT).click();

    await expect(page).toHaveURL("http://127.0.0.1:3001/create-account");

    const usernameFormMessage = page.getByTestId(DataTestId.CommonForm.forMessage(DataTestId.RegisterPage.INPUT_USERNAME));
    await expect(usernameFormMessage).toBeVisible();
  });

  test("should not allow an invalid email", async ({ page }) => {
    const newUserUsername = "playwright-new";
    const newUserEmail = "playwright-new!!!!!";
    const newUserPassword = "passwr0d";

    await page.getByTestId(DataTestId.RegisterPage.INPUT_USERNAME).fill(newUserUsername);
    await page.getByTestId(DataTestId.RegisterPage.INPUT_EMAIL).fill(newUserEmail);
    await page.getByTestId(DataTestId.RegisterPage.INPUT_PASSWORD).fill(newUserPassword);
    await page.getByTestId(DataTestId.RegisterPage.INPUT_CONFIRM_PASSWORD).fill(newUserPassword);

    await page.getByTestId(DataTestId.RegisterPage.BUTTON_CREATE_ACCOUNT).click();

    await expect(page).toHaveURL("http://127.0.0.1:3001/create-account");

    const emailFormMessage = page.getByTestId(DataTestId.CommonForm.forMessage(DataTestId.RegisterPage.INPUT_EMAIL));
    await expect(emailFormMessage).toBeVisible();
  });

  test("should go back to the login page", async ({ page }) => {
    await expect(page).toHaveURL("http://127.0.0.1:3001/create-account");
    await page.getByTestId(DataTestId.RegisterPage.BUTTON_LOGIN).click();
    await expect(page).toHaveURL("http://127.0.0.1:3001/login");
  });
});
