import test from "@playwright/test";

test.describe("Share Meal Plan Story", () => {
  [{isUserSourceUser: true}, {isUserSourceUser: false}].forEach(({ isUserSourceUser }) => {
    test(`should share the meal plan when user is source user is ${isUserSourceUser}`, async ({page, isMobile}) => {

    })
  })
})