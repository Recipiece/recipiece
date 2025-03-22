import test, { expect } from "@playwright/test";
import { cookbookNameGenerator, generateUserWithPassword } from "@recipiece/test";
import { loginUser } from "../fixture/login.fixture";
import { summonDashboardSidebar } from "../fixture/util.fixture";
import { DataTestId } from "@recipiece/constant";
import { prisma } from "@recipiece/database";

test.describe("Create Cookbook Story", () => {
  test("should create a cookbook", async ({ page, isMobile }) => {
    const [user] = await generateUserWithPassword("password");
    await loginUser(user, page, "password");
    await summonDashboardSidebar(page, isMobile);

    await page.getByTestId(DataTestId.DashboardSidebar.SIDEBAR_BUTTON_CREATE_COOKBOOK).click();
    await expect(page.getByTestId(DataTestId.Dialog.CreateCookbookDialog.DIALOG_WRAPPER)).toBeVisible();

    const cookbookName = cookbookNameGenerator.next().value;
    await page.getByTestId(DataTestId.Dialog.CreateCookbookDialog.INPUT_COOKBOOK_NAME).fill(cookbookName);
    await page.getByTestId(DataTestId.Dialog.CreateCookbookDialog.INPUT_COOKBOOK_DESCRIPTION).fill("asdfqwer");

    await page.getByTestId(DataTestId.Dialog.CreateCookbookDialog.BUTTON_SUBMIT).click();
    await expect(page.getByTestId(DataTestId.Dialog.CreateCookbookDialog.DIALOG_WRAPPER)).not.toBeVisible();
    await expect(page.getByTestId(DataTestId.DashboardSidebar.TOAST_COOKBOOK_CREATED)).toBeVisible();

    const createdCookbook = await prisma.cookbook.findFirst({
      where: {
        name: cookbookName,
        user_id: user.id,
      },
    });
    expect(createdCookbook).toBeTruthy();

    await page.getByTestId(DataTestId.DashboardSidebar.SIDEBAR_BUTTON_COOKBOOK(createdCookbook.id)).click();
    await expect(page).toHaveURL(`http://127.0.0.1:3001/cookbook/${createdCookbook.id}`);
  });
});
