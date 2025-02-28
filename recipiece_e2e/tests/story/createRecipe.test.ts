import { faker } from "@faker-js/faker";
import { expect, test } from "@playwright/test";
import { DataTestId } from "@recipiece/constant";
import { generateUserWithPassword } from "@recipiece/test";
import { loginUser } from "../fixture/login.fixture";
import { prisma } from "@recipiece/database";

test.describe("Create Recipe Story", () => {
  /**
   * This story
   * 1. Logs into recipiece
   * 2. Creates a new recipe
   * 3. Navigates back to the dashboard to see the recipe
   * 4. Goes to the view of the recipe
   */
  test("should create a recipe from scratch", async ({ page, isMobile }) => {
    const [user] = await generateUserWithPassword("password");
    await loginUser(user, page);
    await expect(page).toHaveURL("http://127.0.0.1:3001/dashboard");
    await expect(page.getByTestId(DataTestId.NotFound.PARAGRAPH_MESSAGE(DataTestId.DashboardPage.NOT_FOUND))).toBeVisible();

    if (isMobile) {
      const mobileFooter = page.getByTestId(DataTestId.MenuBar.FOOTER_MOBILE_MENU_BAR);
      const createTrigger = mobileFooter.getByTestId(DataTestId.MenuBar.MENU_TRIGGER_CREATE);
      await expect(createTrigger).toBeVisible();
      await createTrigger.click();

      await page.getByTestId(DataTestId.Dialog.MobileCreateMenuDialog.BUTTON_RECIPE_FROM_SCRATCH).click();
    } else {
      const menuBar = page.getByTestId(DataTestId.MenuBar.NAV_DESKTOP_MENU_BAR);
      const createTrigger = menuBar.getByTestId(DataTestId.MenuBar.MENU_TRIGGER_CREATE);
      await expect(createTrigger).toBeVisible();
      await createTrigger.click();

      await page.getByTestId(DataTestId.MenuBar.MENU_ITEM_RECIPE_FROM_SCRATCH).click();
    }

    await expect(page).toHaveURL("http://127.0.0.1:3001/recipe/edit/new");
    await expect(page.getByTestId(DataTestId.RecipeEditPage.INPUT_NAME)).toBeVisible();

    // fill out the recipe basics
    await page.getByTestId(DataTestId.RecipeEditPage.INPUT_NAME).fill("New Recipe");
    await page.getByTestId(DataTestId.RecipeEditPage.INPUT_SERVINGS).fill("100");
    await page.getByTestId(DataTestId.RecipeEditPage.TEXTAREA_DESCRIPTION).fill(faker.word.words({ count: 40 }));
    await page.getByTestId(DataTestId.RecipeEditPage.TYPEAHEAD_INPUT_TAGS).fill("asdf");
    await page.keyboard.press("Enter");
    await expect(page.getByTestId(DataTestId.RecipeEditPage.BADGE_TAG("asdf"))).toBeVisible();

    // INGREDIENTS
    const addIngredientButton = page.getByTestId(DataTestId.RecipeEditPage.BUTTON_ADD_INGREDIENT);
    await addIngredientButton.click();

    // simple name and amount
    await page.getByTestId(DataTestId.RecipeEditPage.INPUT_INGREDIENT_NAME(0)).fill("ingredient 0");
    await page.getByTestId(DataTestId.RecipeEditPage.INPUT_INGREDIENT_AMOUNT(0)).fill("1");

    // add another by clicking
    await addIngredientButton.click();
    await page.getByTestId(DataTestId.RecipeEditPage.INPUT_INGREDIENT_NAME(1)).fill("ingredient 1");
    await page.getByTestId(DataTestId.RecipeEditPage.INPUT_INGREDIENT_AMOUNT(1)).fill("55.54");
    await page.getByTestId(DataTestId.RecipeEditPage.TYPEAHEAD_INPUT_INGREDIENT_UNIT(1)).fill("cups");

    // add another by keyboard event
    await page.keyboard.press("Enter");
    await page.getByTestId(DataTestId.RecipeEditPage.INPUT_INGREDIENT_NAME(2)).fill("ingredient 2");
    await page.getByTestId(DataTestId.RecipeEditPage.INPUT_INGREDIENT_AMOUNT(2)).fill("2 1/3");

    // select the ingredient unit from the suggested autocomplete
    const thirdIngredientUnitInput = page.getByTestId(DataTestId.RecipeEditPage.TYPEAHEAD_INPUT_INGREDIENT_UNIT(2));
    await thirdIngredientUnitInput.fill("ou");
    await thirdIngredientUnitInput.dispatchEvent("focus");

    const unitPopoverContainer = page.getByTestId(DataTestId.TypeaheadInput.POPOVER_CONTAINER(DataTestId.RecipeEditPage.TYPEAHEAD_INPUT_INGREDIENT_UNIT(2)));
    await expect(unitPopoverContainer).toBeVisible();
    const ouncesUnit = unitPopoverContainer.getByText("ounce");
    await expect(ouncesUnit).toBeVisible();
    await ouncesUnit.dispatchEvent("click");

    await expect(unitPopoverContainer).not.toBeVisible();
    await expect(thirdIngredientUnitInput).toHaveValue("ounce");

    // add another ingredient and drag it
    await addIngredientButton.click();
    const fourthIngredientDragHandle = page.getByTestId(DataTestId.RecipeEditPage.INGREDIENT_DRAG_HANDLE(3));
    const secondIngredientDropTarget = page.getByTestId(DataTestId.RecipeEditPage.DIV_INGREDIENT_DROP_TARGET(1));
    await fourthIngredientDragHandle.dragTo(secondIngredientDropTarget);

    await expect(page.getByTestId(DataTestId.RecipeEditPage.INPUT_INGREDIENT_NAME(1))).toHaveValue("");

    // remove an ingredient
    await page.getByTestId(DataTestId.RecipeEditPage.BUTTON_REMOVE_INGREDIENT(1)).nth(1).click();
    await expect(page.getByTestId(DataTestId.RecipeEditPage.INPUT_INGREDIENT_NAME(0))).toHaveValue("ingredient 0");
    await expect(page.getByTestId(DataTestId.RecipeEditPage.INPUT_INGREDIENT_NAME(1))).toHaveValue("ingredient 1");

    // add some steps
    const addStepButton = page.getByTestId(DataTestId.RecipeEditPage.BUTTON_ADD_STEP);
    await addStepButton.click();

    const firstStepTextarea = page.getByTestId(DataTestId.RecipeEditPage.TEXTAREA_STEP_CONTENT(0));
    await firstStepTextarea.fill(faker.word.words({ count: 30 }));

    await addStepButton.click();
    const secondStepTextarea = page.getByTestId(DataTestId.RecipeEditPage.TEXTAREA_STEP_CONTENT(1));
    await secondStepTextarea.fill("second step content");

    /** 
    TODO --- FIX THIS
    // drag the second step to the first
    const firstStepDropTarget = page.getByTestId(DataTestId.RecipeEditPage.DIV_STEP_DROP_TARGET(0));
    const secondStepDragHandle = page.getByTestId(DataTestId.RecipeEditPage.STEP_DRAG_HANDLE(1));
    await secondStepDragHandle.dragTo(firstStepTextarea);
    await expect(page.getByTestId(DataTestId.RecipeEditPage.TEXTAREA_STEP_CONTENT(0))).toHaveText("second step content");
    */

    // remove the second step
    const removeStepButton = page.getByTestId(DataTestId.RecipeEditPage.BUTTON_REMOVE_STEP(0));
    await removeStepButton.click();
    await expect(page.getByTestId(DataTestId.RecipeEditPage.TEXTAREA_STEP_CONTENT(0))).toHaveText("second step content");

    const saveButton = page.getByTestId(DataTestId.RecipeEditPage.BUTTON_SAVE);
    await saveButton.click();
    await page.waitForURL("**/recipe/view/**");
    
    const createdRecipe = await prisma.recipe.findFirst({
      where: {
        user_id: user.id,
      }
    });
    expect(createdRecipe).toBeTruthy();
    expect(page.url()).toEqual(`http://127.0.0.1:3001/recipe/view/${createdRecipe.id}`);

    if(isMobile) {
      const mobileFooter = page.getByTestId(DataTestId.MenuBar.FOOTER_MOBILE_MENU_BAR);
      await mobileFooter.getByTestId(DataTestId.MenuBar.MENU_ITEM_HOME).click();
    } else {
      const menuBar = page.getByTestId(DataTestId.MenuBar.NAV_DESKTOP_MENU_BAR);
      await menuBar.getByTestId(DataTestId.MenuBar.MENU_ITEM_HOME).click();
    }
    await page.waitForURL("**/dashboard");
    
    const recipeCard = page.getByTestId(DataTestId.RecipeCard.CARD_TITLE(createdRecipe.id));
    await expect(recipeCard).toBeVisible();
  });
});
