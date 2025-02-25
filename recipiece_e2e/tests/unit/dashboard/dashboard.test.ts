import { test as base, expect, Page } from "@playwright/test";
import { DataTestId } from "@recipiece/constant";
import { User } from "@recipiece/database";
import { generateRecipe, generateUserWithPassword } from "@recipiece/test";

const test = base.extend<{
  readonly dashboardFixture: {
    readonly user: User;
    readonly loginUser: () => Promise<void>;
  };
}>({
  dashboardFixture: async ({ page }: { page: Page }, use) => {
    const [user] = await generateUserWithPassword("password");

    const loginUser = async () => {
      await page.goto("/login");
      await page.getByTestId(DataTestId.LoginPage.INPUT_USERNAME).fill(user.username);
      await page.getByTestId(DataTestId.LoginPage.INPUT_PASSWORD).fill("password");
      await page.getByTestId(DataTestId.LoginPage.BUTTON_LOGIN).click();

      await page.waitForLoadState("networkidle");
      await expect(page).toHaveURL("http://127.0.0.1:3001/dashboard");
    };

    await use({
      user: user,
      loginUser: loginUser,
    });
  },
});

test.describe("Dashboard - All Recipes", () => {
  test("should display a message when there are no recipes", async ({ page, dashboardFixture }) => {
    const { loginUser } = dashboardFixture;
    await loginUser();
    const notFoundElement = page.getByTestId(DataTestId.NotFound.PARAGRAPH_MESSAGE(DataTestId.DashboardPage.NOT_FOUND));
    await expect(notFoundElement).toBeVisible();
  });

  test("should display recipe cards", async ({ page, dashboardFixture }) => {
    const { user, loginUser } = dashboardFixture;
    const recipes = [];
    for (let i = 0; i < 10; i++) {
      const recipe = await generateRecipe({ user_id: user.id });
      recipes.push(recipe);
    }

    await loginUser();

    for (const recipe of recipes) {
      const cardTitle = page.getByTestId(DataTestId.DashboardPage.RECIPE_CARD_TITLE(recipe.id));
      await expect(cardTitle).toBeVisible();
      expect(await cardTitle.innerText()).toBe(recipe.name);

      const cardDescription = page.getByTestId(DataTestId.DashboardPage.RECIPE_CARD_DESCRIPTION(recipe.id));
      await expect(cardDescription).toBeVisible();
      expect(await cardDescription.innerText()).toBe(recipe.description);
    }
  });

  test("should page", async ({ page }) => {
    
  });

  test("should search by recipe name", async ({ page }) => {});

  test("should advanced search recipes", async ({ page }) => {});

  test("should navigate to a recipe", async ({ page }) => {});
});
