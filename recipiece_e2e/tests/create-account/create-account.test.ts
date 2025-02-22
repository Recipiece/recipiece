import { faker } from "@faker-js/faker";
import { expect, test } from "@playwright/test";
import { DataTestID } from "@recipiece/constant";
import { prisma } from "@recipiece/database";
import { Seed } from "../../util";

test.describe("Register Page", () => {
  let emails: string[];
  let usernames: string[]

  test.beforeAll(() => {
    emails = faker.helpers.uniqueArray(faker.internet.email, 1000);
    usernames = faker.helpers.uniqueArray(faker.internet.username, 1000);
  });

  test.beforeEach(async ({ page }) => {
    await page.goto("/create-account");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL("http://127.0.0.1:3000/create-account");
  });

  test("should allow a user to register", async ({ page }) => {
    const newUserUsername = usernames.pop();
    const newUserEmail = emails.pop();
    const newUserPassword = "passwr0d";

    await page.getByTestId(DataTestID.RegisterPage.INPUT_USERNAME).fill(newUserUsername);
    await page.getByTestId(DataTestID.RegisterPage.INPUT_EMAIL).fill(newUserEmail);
    await page.getByTestId(DataTestID.RegisterPage.INPUT_PASSWORD).fill(newUserPassword);
    await page.getByTestId(DataTestID.RegisterPage.INPUT_CONFIRM_PASSWORD).fill(newUserPassword);

    await page.getByTestId(DataTestID.RegisterPage.BUTTON_CREATE_ACCOUNT).click();
    await page.waitForLoadState("networkidle");

    await page.getByTestId(DataTestID.RegisterPage.TOAST_SUCCESS).waitFor({
      state: "visible",
      timeout: 3000,
    });

    await expect(page).toHaveURL("http://127.0.0.1:3000/login");

    await prisma.user.delete({
      where: {
        email: newUserEmail,
      },
    });
  });

  test("should not allow a duplicate registration, case insensitive", async ({ page }) => {
    const newUserPassword = "passwr0d";
    await page.getByTestId(DataTestID.RegisterPage.INPUT_USERNAME).fill(Seed.PLAYWRIGHT_USER_USERNAME.toUpperCase());
    await page.getByTestId(DataTestID.RegisterPage.INPUT_EMAIL).fill(Seed.PLAYWRIGHT_USER_EMAIL.toUpperCase());
    await page.getByTestId(DataTestID.RegisterPage.INPUT_PASSWORD).fill(newUserPassword);
    await page.getByTestId(DataTestID.RegisterPage.INPUT_CONFIRM_PASSWORD).fill(newUserPassword);

    await page.getByTestId(DataTestID.RegisterPage.BUTTON_CREATE_ACCOUNT).click();
    await page.waitForLoadState("networkidle");

    await page.getByTestId(DataTestID.RegisterPage.TOAST_FAILURE).waitFor({
      state: "visible",
      timeout: 3000,
    });
    await expect(page).toHaveURL("http://127.0.0.1:3000/create-account");
  });

  test("should not allow an empty form", async ({ page }) => {
    await page.getByTestId(DataTestID.RegisterPage.BUTTON_CREATE_ACCOUNT).click();

    await expect(page).toHaveURL("http://127.0.0.1:3000/create-account");

    const usernameFormMessage = page.getByTestId(DataTestID.CommonForm.forMessage(DataTestID.RegisterPage.INPUT_USERNAME));
    await expect(usernameFormMessage).toBeVisible();

    const emailFormMessage = page.getByTestId(DataTestID.CommonForm.forMessage(DataTestID.RegisterPage.INPUT_EMAIL));
    await expect(emailFormMessage).toBeVisible();

    const passwordFormMessage = page.getByTestId(DataTestID.CommonForm.forMessage(DataTestID.RegisterPage.INPUT_PASSWORD));
    await expect(passwordFormMessage).toBeVisible();

    const confirmPasswordFormMessage = page.getByTestId(DataTestID.CommonForm.forMessage(DataTestID.RegisterPage.INPUT_CONFIRM_PASSWORD));
    await expect(confirmPasswordFormMessage).toBeVisible();
  });

  test("should not allow mismatched passwords", async ({ page }) => {
    const newUserUsername = "playwright-new";
    const newUserEmail = "playwright-new@recipiece.org";
    const newUserPassword = "passwr0d";

    await page.getByTestId(DataTestID.RegisterPage.INPUT_USERNAME).fill(newUserUsername);
    await page.getByTestId(DataTestID.RegisterPage.INPUT_EMAIL).fill(newUserEmail);
    await page.getByTestId(DataTestID.RegisterPage.INPUT_PASSWORD).fill(newUserPassword);
    await page.getByTestId(DataTestID.RegisterPage.INPUT_CONFIRM_PASSWORD).fill(`asdf${newUserPassword}`);

    await page.getByTestId(DataTestID.RegisterPage.BUTTON_CREATE_ACCOUNT).click();

    await expect(page).toHaveURL("http://127.0.0.1:3000/create-account");

    const confirmPasswordFormMessage = page.getByTestId(DataTestID.CommonForm.forMessage(DataTestID.RegisterPage.INPUT_CONFIRM_PASSWORD));
    await expect(confirmPasswordFormMessage).toBeVisible();
  });

  test("should not allow a username less than 5 characters", async ({page}) => {
    const newUserEmail = "playwright-new@recipiece.org";
    const newUserPassword = "passwr0d";

    await page.getByTestId(DataTestID.RegisterPage.INPUT_USERNAME).fill("shrt");
    await page.getByTestId(DataTestID.RegisterPage.INPUT_EMAIL).fill(newUserEmail);
    await page.getByTestId(DataTestID.RegisterPage.INPUT_PASSWORD).fill(newUserPassword);
    await page.getByTestId(DataTestID.RegisterPage.INPUT_CONFIRM_PASSWORD).fill(newUserPassword);

    await page.getByTestId(DataTestID.RegisterPage.BUTTON_CREATE_ACCOUNT).click();

    await expect(page).toHaveURL("http://127.0.0.1:3000/create-account");

    const usernameFormMessage = page.getByTestId(DataTestID.CommonForm.forMessage(DataTestID.RegisterPage.INPUT_USERNAME));
    await expect(usernameFormMessage).toBeVisible();
  });

  test("should not allow an invalid email", async ({page}) => {
    const newUserUsername = "playwright-new";
    const newUserEmail = "playwright-new!!!!!";
    const newUserPassword = "passwr0d";

    await page.getByTestId(DataTestID.RegisterPage.INPUT_USERNAME).fill(newUserUsername);
    await page.getByTestId(DataTestID.RegisterPage.INPUT_EMAIL).fill(newUserEmail);
    await page.getByTestId(DataTestID.RegisterPage.INPUT_PASSWORD).fill(newUserPassword);
    await page.getByTestId(DataTestID.RegisterPage.INPUT_CONFIRM_PASSWORD).fill(newUserPassword);

    await page.getByTestId(DataTestID.RegisterPage.BUTTON_CREATE_ACCOUNT).click();

    await expect(page).toHaveURL("http://127.0.0.1:3000/create-account");

    const emailFormMessage = page.getByTestId(DataTestID.CommonForm.forMessage(DataTestID.RegisterPage.INPUT_EMAIL));
    await expect(emailFormMessage).toBeVisible();
  });

  test("should go back to the login page", async ({page}) => {
    await expect(page).toHaveURL("http://127.0.0.1:3000/create-account");
    await page.getByTestId(DataTestID.RegisterPage.BUTTON_LOGIN).click();
    await expect(page).toHaveURL("http://127.0.0.1:3000/login");
  });
});
