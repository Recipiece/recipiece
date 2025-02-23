import { expect, test } from "@playwright/test";
import { generateUserWithPassword } from "@recipiece/test";
import { LoginPage } from "../../../recipiece_common/recipiece_constant/src/dataTestId";
import { Data, DataTestId } from "@recipiece/constant";
import { prisma } from "@recipiece/database";

/**
 * Walk through the whole forgot-password flow.
 * 1. Navigate from the login page to the forgot password page
 * 2. Enter in a your email
 * 3. Navigate to the reset password page using the token
 * 4. Enter in a new password
 * 5. Login with the new password
 */
test("Forgot Password Story", async ( {page}) => {
  const oldPassword = "oldPassword";
  const newPassword = "newPassword!";
  const [user] = await generateUserWithPassword(oldPassword);

  await page.goto("/login");
  await page.getByTestId(LoginPage.BUTTON_FORGOT_PASSWORD).click();

  await expect(page).toHaveURL("http://127.0.0.1:3001/forgot-password");
  await page.getByTestId(DataTestId.ForgotPasswordPage.INPUT_EMAIL).fill(user.email);
  await page.getByTestId(DataTestId.ForgotPasswordPage.BUTTON_FORGOT_PASSWORD).click();
  await page.waitForLoadState("networkidle");

  const createdToken = await prisma.userValidationToken.findFirst({
    where: {
      user_id: user.id,
      purpose: Data.UserValidationTokenTypes.FORGOT_PASSWORD.purpose,
    }
  });
  expect(createdToken).toBeTruthy();

  const resetUrl = `/reset-password?token=${createdToken.id}`;
  await page.goto(resetUrl);
  await expect(page).toHaveURL(`http://127.0.0.1:3001${resetUrl}`);
  
  await page.getByTestId(DataTestId.ResetPasswordPage.INPUT_PASSWORD).fill(newPassword);
  await page.getByTestId(DataTestId.ResetPasswordPage.INPUT_CONFIRM_PASSWORD).fill(newPassword);
  await page.getByTestId(DataTestId.ResetPasswordPage.BUTTON_RESET_PASSWORD).click();
  await page.waitForLoadState("networkidle");

  await expect(page).toHaveURL("http://127.0.0.1:3001/login");
  await page.getByTestId(DataTestId.LoginPage.INPUT_USERNAME).fill(user.email);
  await page.getByTestId(DataTestId.LoginPage.INPUT_PASSWORD).fill(newPassword);
  await page.getByTestId(DataTestId.LoginPage.BUTTON_LOGIN).click();
  await page.waitForLoadState("networkidle");

  await expect(page).toHaveURL("http://127.0.0.1:3001/dashboard");
})
