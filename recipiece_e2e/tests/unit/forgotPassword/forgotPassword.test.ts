import { expect, test } from "@playwright/test";
import { DataTestId } from "@recipiece/constant";
import { emailGenerator, generateUserWithPassword } from "@recipiece/test";

test.describe("Forgot Password Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/forgot-password");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL("http://127.0.0.1:3001/forgot-password");
  });

  test("should tell the user they will receive a password reset email", async ({ page }) => {
    const [user] = await generateUserWithPassword("password");

    await page.getByTestId(DataTestId.ForgotPasswordPage.INPUT_EMAIL).fill(user.email);
    await page.getByTestId(DataTestId.ForgotPasswordPage.BUTTON_FORGOT_PASSWORD).click();
    await page.waitForLoadState("networkidle");

    await expect(page).toHaveURL("http://127.0.0.1:3001/forgot-password");
    const infoText = page.getByTestId(DataTestId.ForgotPasswordPage.PARAGRAPH_SENT);
    await expect(infoText).toBeVisible();
  });

  test("should show the info text even if the email does not exist", async ({ page }) => {
    const nonsenseEmail = emailGenerator.next().value;

    await page.getByTestId(DataTestId.ForgotPasswordPage.INPUT_EMAIL).fill(nonsenseEmail);
    await page.getByTestId(DataTestId.ForgotPasswordPage.BUTTON_FORGOT_PASSWORD).click();
    await page.waitForLoadState("networkidle");

    await expect(page).toHaveURL("http://127.0.0.1:3001/forgot-password");
    const infoText = page.getByTestId(DataTestId.ForgotPasswordPage.PARAGRAPH_SENT);
    await expect(infoText).toBeVisible();
  });

  test("should not allow an empty form", async ({ page }) => {
    await page.getByTestId(DataTestId.ForgotPasswordPage.BUTTON_FORGOT_PASSWORD).click();
    await expect(page).toHaveURL("http://127.0.0.1:3001/forgot-password");
    const errorMessage = page.getByTestId(DataTestId.CommonForm.forMessage(DataTestId.ForgotPasswordPage.INPUT_EMAIL));
    await expect(errorMessage).toBeVisible();
  });

  test("should go to login", async ({ page }) => {
    await page.getByTestId(DataTestId.ForgotPasswordPage.BUTTON_LOGIN).click();
    await expect(page).toHaveURL("http://127.0.0.1:3001/login");
  });
});
