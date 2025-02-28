import { expect, test } from "@playwright/test";
import { Constant, DataTestId } from "@recipiece/constant";
import { generateUserValidationToken, generateUserWithPassword, uuidGenerator } from "@recipiece/test";

test.describe("Reset Password Page", () => {
  test("should not allow you to hit the page without a token", async ({ page }) => {
    await page.waitForLoadState("networkidle");
    await page.goto("/reset-password");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toEqual("http://127.0.0.1:3001/login");
  });

  test("should reset the users password", async ({ page }) => {
    const [user] = await generateUserWithPassword("password");
    const token = await generateUserValidationToken({
      user_id: user.id,
      purpose: Constant.UserValidationTokenTypes.FORGOT_PASSWORD.purpose,
    });
    const url = `/reset-password?token=${token.id}`;

    await page.goto(url);
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(`http://127.0.0.1:3001${url}`);

    const newPassword = "p@ssw0Rd";

    await page.getByTestId(DataTestId.ResetPasswordPage.INPUT_PASSWORD).fill(newPassword);
    await page.getByTestId(DataTestId.ResetPasswordPage.INPUT_CONFIRM_PASSWORD).fill(newPassword);

    await page.getByTestId(DataTestId.ResetPasswordPage.BUTTON_RESET_PASSWORD).click();
    await page.waitForLoadState("networkidle");

    await page.getByTestId(DataTestId.ResetPasswordPage.TOAST_SUCCESS).waitFor({
      state: "visible",
      timeout: 3000,
    });

    await expect(page).toHaveURL("http://127.0.0.1:3001/login");
  });

  test("should not accept an empty form", async ({ page }) => {
    const token = await generateUserValidationToken({
      purpose: Constant.UserValidationTokenTypes.FORGOT_PASSWORD.purpose,
    });
    const url = `/reset-password?token=${token.id}`;

    await page.goto(url);
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(`http://127.0.0.1:3001${url}`);

    await page.getByTestId(DataTestId.ResetPasswordPage.BUTTON_RESET_PASSWORD).click();
    await expect(page).toHaveURL(`http://127.0.0.1:3001${url}`);

    const passwordErrorMessage = page.getByTestId(DataTestId.Form.MESSAGE(DataTestId.ResetPasswordPage.INPUT_PASSWORD));
    await expect(passwordErrorMessage).toBeVisible();

    const confirmErrorMessage = page.getByTestId(DataTestId.Form.MESSAGE(DataTestId.ResetPasswordPage.INPUT_CONFIRM_PASSWORD));
    await expect(confirmErrorMessage).toBeVisible();
  });

  test("should not accept mismatched passwords", async ({ page }) => {
    const token = await generateUserValidationToken({
      purpose: Constant.UserValidationTokenTypes.FORGOT_PASSWORD.purpose,
    });
    const url = `/reset-password?token=${token.id}`;

    await page.goto(url);
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(`http://127.0.0.1:3001${url}`);

    const newPassword = "p@ssw0Rd";

    await page.getByTestId(DataTestId.ResetPasswordPage.INPUT_PASSWORD).fill(newPassword);
    await page.getByTestId(DataTestId.ResetPasswordPage.INPUT_CONFIRM_PASSWORD).fill(`asdf${newPassword}`);

    await page.getByTestId(DataTestId.ResetPasswordPage.BUTTON_RESET_PASSWORD).click();
    await expect(page).toHaveURL(`http://127.0.0.1:3001${url}`);

    const confirmErrorMessage = page.getByTestId(DataTestId.Form.MESSAGE(DataTestId.ResetPasswordPage.INPUT_CONFIRM_PASSWORD));
    await expect(confirmErrorMessage).toBeVisible();
  });

  test("should error on a bad token", async ({ page }) => {
    const badToken = uuidGenerator.next().value;
    const url = `/reset-password?token=${badToken}`;

    await page.goto(url);
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(`http://127.0.0.1:3001${url}`);

    const newPassword = "p@ssw0Rd";

    await page.getByTestId(DataTestId.ResetPasswordPage.INPUT_PASSWORD).fill(newPassword);
    await page.getByTestId(DataTestId.ResetPasswordPage.INPUT_CONFIRM_PASSWORD).fill(newPassword);
    await page.getByTestId(DataTestId.ResetPasswordPage.BUTTON_RESET_PASSWORD).click();

    await expect(page).toHaveURL(`http://127.0.0.1:3001${url}`);

    await page.getByTestId(DataTestId.ResetPasswordPage.TOAST_FAILURE).waitFor({
      state: "visible",
      timeout: 3000,
    });
  });

  test("should go to login", async ({ page }) => {
    const token = await generateUserValidationToken({
      purpose: Constant.UserValidationTokenTypes.FORGOT_PASSWORD.purpose,
    });
    const url = `/reset-password?token=${token.id}`;
    await page.goto(url);
    await page.waitForLoadState("networkidle");

    await page.getByTestId(DataTestId.ResetPasswordPage.BUTTON_LOGIN).click();
    await expect(page).toHaveURL("http://127.0.0.1:3001/login");
  });
});
