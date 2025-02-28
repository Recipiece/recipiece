import { test as base, expect, Page } from "@playwright/test";
import { Constant, DataTestId } from "@recipiece/constant";
import { User } from "@recipiece/database";
import { generateRecipe, generateUserWithPassword } from "@recipiece/test";

const test = base.extend<{
  readonly dashboardFixture: {
    readonly user: User;
    readonly navigateToPage: () => Promise<void>;
  };
}>({
  dashboardFixture: async ({ page }: { page: Page }, use) => {
    const [user] = await generateUserWithPassword("password");

    const navigateToPage = async () => {
      await page.goto("/login");
      await page.getByTestId(DataTestId.LoginPage.INPUT_USERNAME).fill(user.username);
      await page.getByTestId(DataTestId.LoginPage.INPUT_PASSWORD).fill("password");
      await page.getByTestId(DataTestId.LoginPage.BUTTON_LOGIN).click();

      await page.waitForLoadState("networkidle");
      await expect(page).toHaveURL("http://127.0.0.1:3001/dashboard");
    };

    await use({
      user: user,
      navigateToPage,
    });
  },
});

test.describe("Dashboard - All Recipes", () => {
  test("should display a message when there are no recipes", async ({ page, dashboardFixture }) => {
    const { navigateToPage } = dashboardFixture;
    await navigateToPage();
    const notFoundElement = page.getByTestId(DataTestId.NotFound.PARAGRAPH_MESSAGE(DataTestId.DashboardPage.NOT_FOUND));
    await expect(notFoundElement).toBeVisible();
  });

  test("should display recipe cards", async ({ page, dashboardFixture }) => {
    const { user, navigateToPage } = dashboardFixture;
    const recipes = [];
    for (let i = 0; i < 10; i++) {
      const recipe = await generateRecipe({ user_id: user.id });
      recipes.push(recipe);
    }

    await navigateToPage();

    for (const recipe of recipes) {
      const cardTitle = page.getByTestId(DataTestId.RecipeCard.CARD_TITLE(recipe.id));
      await expect(cardTitle).toBeVisible();
      expect(await cardTitle.innerText()).toBe(recipe.name);

      const cardDescription = page.getByTestId(DataTestId.RecipeCard.PARAGRAPH_CARD_DESCRIPTION(recipe.id));
      await expect(cardDescription).toBeVisible();
      expect(await cardDescription.innerText()).toBe(recipe.description);
    }
  });

  test("should page", async ({ page, dashboardFixture }) => {
    const { user, navigateToPage } = dashboardFixture;
    const recipes = [];
    for (let i = 0; i < Constant.DEFAULT_PAGE_SIZE + 1; i++) {
      const recipe = await generateRecipe({ user_id: user.id });
      recipes.push(recipe);
    }

    await navigateToPage();

    const pagerContainer = page.getByTestId(DataTestId.Pager.NAV_PAGER(DataTestId.DashboardPage.PAGER));
    await expect(pagerContainer).toBeVisible();
    await expect(pagerContainer.getByText("1")).toBeVisible();

    const nextPageButton = page.getByTestId(DataTestId.Pager.BUTTON_NEXT_PAGE(DataTestId.DashboardPage.PAGER));
    await expect(nextPageButton).toBeVisible();
    await nextPageButton.click();
    await page.waitForLoadState("networkidle");

    await expect(pagerContainer.getByText("2")).toBeVisible();

    const lastRecipe = recipes[recipes.length - 1];
    await expect(page.getByTestId(DataTestId.RecipeCard.CARD_TITLE(lastRecipe.id))).toBeVisible();

    const previousPageButton = page.getByTestId(DataTestId.Pager.BUTTON_PREVIOUS(DataTestId.DashboardPage.PAGER));
    await expect(previousPageButton).toBeVisible();
    await previousPageButton.click();
    await expect(page.getByTestId(DataTestId.RecipeCard.CARD_TITLE(lastRecipe.id))).not.toBeVisible();
  });

  test("should navigate to a recipe", async ({ page, dashboardFixture }) => {
    const { user, navigateToPage } = dashboardFixture;
    const recipe = await generateRecipe({
      user_id: user.id,
    });

    await navigateToPage();

    const cardTitle = page.getByTestId(DataTestId.RecipeCard.CARD_TITLE(recipe.id));
    await expect(cardTitle).toBeVisible();
    await cardTitle.click();

    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(`http://127.0.0.1:3001/recipe/view/${recipe.id}`);
  });

  test.describe("Recipe Search", () => {
    test("should search by recipe name", async ({ page, dashboardFixture }) => {
      const { user, navigateToPage } = dashboardFixture;
      const recipeToFind = await generateRecipe({
        name: "first",
        user_id: user.id,
      });

      const recipeNotToFind = await generateRecipe({
        name: "second",
        user_id: user.id,
      });

      await navigateToPage();

      const searchBar = page.getByTestId(DataTestId.RecipeSearchBar.INPUT_SEARCH(DataTestId.DashboardPage.RECIPE_SEARCH_BAR));
      await expect(searchBar).toBeVisible();

      await searchBar.fill(recipeToFind.name.toUpperCase().substring(0, 3));
      await page.waitForLoadState("networkidle");

      const firstRecipeCard = page.getByTestId(DataTestId.RecipeCard.CARD_TITLE(recipeToFind.id));
      await expect(firstRecipeCard).toBeVisible();

      const secondRecipeCard = page.getByTestId(DataTestId.RecipeCard.CARD_TITLE(recipeNotToFind.id));
      await expect(secondRecipeCard).not.toBeVisible();
    });

    test("should advanced search recipes", async ({ page }) => {});
  });
});
