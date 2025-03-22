import test, { expect } from "@playwright/test";
import { DataTestId } from "@recipiece/constant";
import { generateUserWithPassword } from "@recipiece/test";
import { loginUser } from "../../fixture/login.fixture";

test.describe("Not Found Page", () => {
  test("should take you to login when unauthenticated", async ({page}) => {
    await page.goto("/login-nonsense");
    const goBackButton = page.getByTestId(DataTestId.NotFound.BUTTON_GO_BACK(DataTestId.NotFoundPage.NOT_FOUND));
    await expect(goBackButton).toBeVisible();
    await goBackButton.click();

    expect(page.url()).toBe("http://127.0.0.1:3001/login");
  });

  test("should take you to dashboard when authenticated", async ({page}) => {
    const [user] = await generateUserWithPassword("password");
    await loginUser(user, page);
    expect(page.url()).toBe("http://127.0.0.1:3001/dashboard");

    await page.goto("/dashboard-nonsense");
    const goBackButton = page.getByTestId(DataTestId.NotFound.BUTTON_GO_BACK(DataTestId.NotFoundPage.NOT_FOUND));
    await expect(goBackButton).toBeVisible();
    await goBackButton.click();

    expect(page.url()).toBe("http://127.0.0.1:3001/dashboard");
  });
})
