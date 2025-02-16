import { User } from "@recipiece/database";

describe("List Notifications", () => {
  let user: User;
  let bearerToken: string;

  beforeEach(async () => {
    [user, bearerToken] = await fixtures.createUserAndToken();
  });

  it("should list notifications for a user", async () => {

  });

  it("should list notifications that are attached to an accepted user kitchen membership", async () => {

  });

  it("should not list notifications that are attached to a denied user kitchen membership", async () => {

  });

  it("should not list notifications that do not belong to you", async () => {

  });

  it("should page", async () => {

  });
});
