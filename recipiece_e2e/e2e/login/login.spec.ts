import { test, expect } from "@playwright/test";
import { LoginResponseSchema } from "@recipiece_types";
import { randomUUID } from "crypto";

test("logs the user in", async ({ page }) => {
  await page.route("*/**/user/login", async (route) => {
    await route.fulfill({
      json: <LoginResponseSchema>{
        access_token: randomUUID().toString(),
        refresh_token: randomUUID().toString(),
      },
    });
  });

  await page.goto("/login");

  const usernameInput = page.getByTestId("input-username");
  const passwordInput = page.getByTestId("input-password");
  const submitButton = page.getByTestId("button-login");

  await usernameInput.fill("testuser@recipiece.org");
  await passwordInput.fill("testpassword");

  await submitButton.click();
});

test("sends the user to the registration page", async ({page}) => {
  await page.goto("/login");
  const registerButton = page.getByTestId("button-register");
  await registerButton.click();
  expect(page.url().endsWith("/create-account")).toBeTruthy();
});

test("sends the user to the forgot password page", async ({page}) => {
  await page.goto("/login");
  const forgotPasswordButton = page.getByTestId("button-forgot-password");
  await forgotPasswordButton.click();
  expect(page.url().endsWith("/forgot-password")).toBeTruthy();
});
