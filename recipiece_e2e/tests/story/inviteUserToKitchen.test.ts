import test, { expect } from "@playwright/test";
import { DataTestId } from "@recipiece/constant";
import { prisma } from "@recipiece/database";
import { generateCookbook, generateRecipe, generateUserWithPassword } from "@recipiece/test";
import { loginUser, logoutUser } from "../fixture/login.fixture";
import { AuthenticatedNav } from "../fixture/pagenav.fixture";
import { dismissDashboardSidebar } from "../fixture/util.fixture";

test.describe("Invite User To Kitchen", () => {
  /**
   * This story
   * 1. Logs into recipiece
   * 2. Extends an invitation to another user
   * 3. Logs in as the other user
   * 4. Performs the action as the other user
   * 5. Checks that the user's recipe and cookbook are fetched on the dashboard page
   * 6. Logs back in as the user
   * 7. Validates that the other user's recipe and cookbook are present on the dashboard page
   * 8. Validates the memberships page reflects the correct info
   */
  [{ action: "accept" }, { action: "deny" }].forEach((param) => {
    test(`should ${param.action} an invitation`, async ({ page, isMobile }) => {
      const [user] = await generateUserWithPassword("password");
      const userRecipe = await generateRecipe({ user_id: user.id });
      const userCookbook = await generateCookbook({ user_id: user.id });

      const [otherUser] = await generateUserWithPassword("password");
      const otherUserRecipe = await generateRecipe({ user_id: otherUser.id });
      const otherUserCookbook = await generateCookbook({ user_id: otherUser.id });

      await loginUser(user, page);

      // nav to the memberships page
      await AuthenticatedNav.toMembershipsPage(page, isMobile);

      // open the context menu and send an invite to the other user
      const membershipContextMenuTrigger = page.getByTestId(DataTestId.MembershipsPage.CONTEXT_MENU_TRIGGER);
      await expect(membershipContextMenuTrigger).toBeVisible();
      await membershipContextMenuTrigger.click();
      const sendInviteMenuItem = page.getByTestId(DataTestId.MembershipsPage.CONTEXT_MENU_ITEM_SEND_INVITATION);
      await expect(sendInviteMenuItem).toBeVisible();
      await sendInviteMenuItem.click();

      await expect(page.getByTestId(DataTestId.Dialog.ExtendUserKitchenInvitationDialog.DIALOG_WRAPPER)).toBeVisible();
      const usernameInput = page.getByTestId(DataTestId.Dialog.ExtendUserKitchenInvitationDialog.INPUT_USERNAME);
      await usernameInput.fill(otherUser.username);
      const sendInviteButton = page.getByTestId(DataTestId.Dialog.ExtendUserKitchenInvitationDialog.BUTTON_SEND_INVITE);
      await sendInviteButton.click();

      // the dialog should have closed and a toast should have popped
      await expect(page.getByTestId(DataTestId.Dialog.ExtendUserKitchenInvitationDialog.DIALOG_WRAPPER)).not.toBeVisible();
      await expect(page.getByTestId(DataTestId.MembershipsPage.TOAST_INVITE_SENT)).toBeVisible();
      const toastText = await page.getByTestId(DataTestId.MembershipsPage.TOAST_INVITE_SENT).innerText();
      expect(toastText.includes(otherUser.username)).toBeTruthy();

      const createdMembership = await prisma.userKitchenMembership.findFirst({
        where: {
          source_user_id: user.id,
          destination_user_id: otherUser.id,
        },
      });
      expect(createdMembership).toBeTruthy();

      // make sure the query cache updates properly and doesn't put the invite into the list of invites on this page
      await expect(page.getByTestId(DataTestId.MembershipsPage.PENDING_MEMBERSHIP_NAME(createdMembership.id))).not.toBeVisible();
      await expect(page.getByTestId(DataTestId.MembershipsPage.LINK_ACCEPTED_MEMBERSHIP(createdMembership.id))).not.toBeVisible();

      // go back to the dashboard and make sure nothing from otherUser is there
      await AuthenticatedNav.toKitchen("all", page, isMobile);
      await dismissDashboardSidebar(page, isMobile);
      await expect(page.getByTestId(DataTestId.RecipeCard.CARD_TITLE(userRecipe.id))).toBeVisible();
      await expect(page.getByTestId(DataTestId.RecipeCard.CARD_TITLE(otherUserRecipe.id))).not.toBeVisible();

      if (isMobile) {
        await page.getByTestId(DataTestId.DashboardSidebar.SIDEBAR_TRIGGER_MOBILE).click();
      }
      await expect(page.getByTestId(DataTestId.DashboardSidebar.SIDEBAR_BUTTON_COOKBOOK(userCookbook.id))).toBeVisible();
      await expect(page.getByTestId(DataTestId.DashboardSidebar.SIDEBAR_BUTTON_COOKBOOK(otherUserCookbook.id))).not.toBeVisible();
      await dismissDashboardSidebar(page, isMobile);

      // log out and log in as the other user
      await logoutUser(page, isMobile);
      await loginUser(otherUser, page);

      // nav to the memberships page
      await AuthenticatedNav.toMembershipsPage(page, isMobile);

      const pendingItem = page.getByTestId(DataTestId.MembershipsPage.PENDING_MEMBERSHIP_NAME(createdMembership.id));
      await expect(pendingItem).toBeVisible();
      const pendingItemText = await pendingItem.innerText();
      expect(pendingItemText.includes(user.username)).toBeTruthy();

      if (param.action === "accept") {
        // the item should move from pending to accepted
        await page.getByTestId(DataTestId.MembershipsPage.BUTTON_ACCEPT_INVITE(createdMembership.id)).click();
        const acceptedTextElement = page.getByTestId(DataTestId.MembershipsPage.LINK_ACCEPTED_MEMBERSHIP(createdMembership.id));
        await expect(acceptedTextElement).toBeVisible();
        expect(page.getByTestId(DataTestId.MembershipsPage.PENDING_MEMBERSHIP_NAME(createdMembership.id))).not.toBeVisible();

        await expect(page.getByTestId(DataTestId.MembershipsPage.TOAST_INVITE_ACCEPTED)).toBeVisible();
      } else {
        // the item should move out of pending and not be in the accepted section
        await page.getByTestId(DataTestId.MembershipsPage.BUTTON_DENY_INVITE(createdMembership.id)).click();
        await expect(page.getByTestId(DataTestId.MembershipsPage.PENDING_MEMBERSHIP_NAME(createdMembership.id))).not.toBeVisible();
        await expect(page.getByTestId(DataTestId.MembershipsPage.LINK_ACCEPTED_MEMBERSHIP(createdMembership.id))).not.toBeVisible();
        await expect(page.getByTestId(DataTestId.MembershipsPage.TOAST_INVITE_DENIED)).toBeVisible();
      }

      // nav back to the dashboard and check the recipe and cookbook
      await AuthenticatedNav.toKitchen("all", page, isMobile);
      if (param.action === "accept") {
        await expect(page.getByTestId(DataTestId.RecipeCard.CARD_TITLE(otherUserRecipe.id))).toBeVisible();
        await expect(page.getByTestId(DataTestId.RecipeCard.CARD_TITLE(userRecipe.id))).toBeVisible();
      } else {
        await expect(page.getByTestId(DataTestId.RecipeCard.CARD_TITLE(otherUserRecipe.id))).toBeVisible();
        await expect(page.getByTestId(DataTestId.RecipeCard.CARD_TITLE(userRecipe.id))).not.toBeVisible();
      }

      if (isMobile) {
        await page.getByTestId(DataTestId.DashboardSidebar.SIDEBAR_TRIGGER_MOBILE).click();
      }

      if (param.action === "accept") {
        await expect(page.getByTestId(DataTestId.DashboardSidebar.SIDEBAR_BUTTON_COOKBOOK(otherUserCookbook.id))).toBeVisible();
        await expect(page.getByTestId(DataTestId.DashboardSidebar.SIDEBAR_BUTTON_COOKBOOK(userCookbook.id))).toBeVisible();
      } else {
        await expect(page.getByTestId(DataTestId.DashboardSidebar.SIDEBAR_BUTTON_COOKBOOK(otherUserCookbook.id))).toBeVisible();
        await expect(page.getByTestId(DataTestId.DashboardSidebar.SIDEBAR_BUTTON_COOKBOOK(userCookbook.id))).not.toBeVisible();
      }
    });
  });
});
