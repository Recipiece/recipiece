import { faker } from "@faker-js/faker";

function* generateEmail(): Generator<string> {
  const emails = [...faker.helpers.uniqueArray(faker.internet.email, 1000)];
  while (true) {
    if (emails.length === 0) {
      emails.push(...faker.helpers.uniqueArray(faker.internet.email, 1000));
    }
    yield emails.pop()!;
  }
}

function* generateUsername(): Generator<string> {
  const usernames = [...faker.helpers.uniqueArray(faker.internet.username, 1000)];
  while (true) {
    if (usernames.length === 0) {
      usernames.push(...faker.helpers.uniqueArray(faker.internet.username, 1000));
    }
    yield usernames.pop()!;
  }
}

function* generateTag(): Generator<string> {
  const tags = [...faker.helpers.uniqueArray(faker.word.words, 1000)];
  while (true) {
    if (tags.length === 0) {
      tags.push(...faker.helpers.uniqueArray(faker.word.words, 1000));
    }
    yield tags.pop()!;
  }
}

function* generateCookbookName(): Generator<string> {
  const cookbookNames = [...faker.helpers.uniqueArray(faker.book.title, 1000)];
  while (true) {
    if (cookbookNames.length === 0) {
      cookbookNames.push(...faker.helpers.uniqueArray(faker.book.title, 1000));
    }
    yield cookbookNames.pop()!;
  }
}

// this is a little silly but faker has it and I wanna use is this way so :shrug:
function* generateUUID(): Generator<string> {
  while(true) {
    yield faker.string.uuid();
  }
}

export const emailGenerator = generateEmail();
export const usernameGenerator = generateUsername();
export const tagGenerator = generateTag();
export const cookbookNameGenerator = generateCookbookName();
export const uuidGenerator = generateUUID();
