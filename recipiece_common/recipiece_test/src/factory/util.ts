import { faker } from "@faker-js/faker";

export const randomWord = (): string => {
  return faker.word.words({ count: 1 });
};

export const randomSentence = (args?: Parameters<typeof faker.word.words>[0]): string => {
  const parsedArgs: typeof args = args ?? {
    count: faker.number.int({ min: 2, max: 20 }),
  };
  return faker.word.words(parsedArgs);
};

export const randomInt = (args?: Parameters<typeof faker.number.int>[0]): number => {
  return faker.number.int(args);
};
