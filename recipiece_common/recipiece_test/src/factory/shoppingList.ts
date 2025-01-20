import { prisma, ShoppingList, ShoppingListItem, ShoppingListShare, UserKitchenMembership } from "@recipiece/database";
import { generateUser, generateUserKitchenMembership } from "./user";
import { faker } from "@faker-js/faker";

type FullShoppingListInput = Partial<Omit<ShoppingList, "id">> & {
  readonly shopping_list_items: Partial<Omit<ShoppingListItem, "id" | "order" | "shopping_list_id">>[];
};

type FullShoppingListOutput = ShoppingList & {
  readonly shopping_list_items: ShoppingListItem[];
};

export const generateShoppingListWithItems = async (list?: FullShoppingListInput): Promise<FullShoppingListOutput> => {
  const { shopping_list_items, ...restList } = list ?? {};

  const baseList = await generateShoppingList(restList);

  let items: ShoppingListItem[] = [];
  if (shopping_list_items !== null && shopping_list_items !== undefined) {
    items = await Promise.all(
      shopping_list_items.map((item) => {
        return generateShoppingListItem({
          ...item,
          shopping_list_id: baseList.id,
        });
      })
    );
  } else {
    const numCompleted = faker.number.int({ min: 1, max: 20 });
    const numIncomplete = faker.number.int({ min: 1, max: 20 });
    for (let i = 0; i < numCompleted; i++) {
      const genned = await generateShoppingListItem({
        shopping_list_id: baseList.id,
        completed: true,
      });
      items.push(genned);
    }
    for (let i = 0; i < numIncomplete; i++) {
      const genned = await generateShoppingListItem({
        shopping_list_id: baseList.id,
        completed: false,
      });
      items.push(genned);
    }
  }

  return {
    ...baseList,
    shopping_list_items: [...items],
  };
};

export const generateShoppingListShare = async (share?: Partial<Omit<ShoppingListShare, "id">>) => {
  let shoppingList: ShoppingList | undefined = undefined;
  if (share?.shopping_list_id) {
    shoppingList =
      (await prisma.shoppingList.findFirst({
        where: {
          id: share.shopping_list_id,
        },
      })) ?? undefined;
  }

  if (!shoppingList) {
    shoppingList = await generateShoppingList();
  }

  let membership: UserKitchenMembership | undefined = undefined;
  if (share?.user_kitchen_membership_id) {
    membership =
      (await prisma.userKitchenMembership.findFirst({
        where: {
          id: share.user_kitchen_membership_id,
        },
      })) ?? undefined;
  }

  if (!membership) {
    membership = await generateUserKitchenMembership({
      source_user_id: shoppingList.user_id,
      status: "accepted",
    });
  }

  return prisma.shoppingListShare.create({
    data: {
      shopping_list_id: shoppingList.id,
      user_kitchen_membership_id: membership.id,
      created_at: share?.created_at,
    },
  });
};

export const generateShoppingListItem = async (item?: Partial<Omit<ShoppingListItem, "id" | "order">>) => {
  const shoppingListId = item?.shopping_list_id ?? (await generateShoppingList()).id;
  const isCompleted = item?.completed ?? faker.number.int({ min: 0, max: 1 }) % 2 === 0;

  let notes = item?.notes;
  if (!notes) {
    const shouldGen = faker.number.int({ min: 0, max: 1 }) % 2 === 0;
    if (shouldGen) {
      notes = faker.word.words({
        count: {
          min: 2,
          max: 10,
        },
      });
    }
  }

  const currentCount = await prisma.shoppingListItem.count({
    where: {
      shopping_list_id: shoppingListId,
      completed: isCompleted,
    },
  });

  return prisma.shoppingListItem.create({
    data: {
      shopping_list_id: shoppingListId,
      order: currentCount + 1,
      completed: isCompleted,
      content: item?.content ?? faker.food.ingredient(),
      notes: notes,
    },
  });
};

export const generateShoppingList = async (shoppingList?: Partial<Omit<ShoppingList, "id">>) => {
  const userId = shoppingList?.user_id ?? (await generateUser()).id;

  return prisma.shoppingList.create({
    data: {
      name: shoppingList?.name ?? faker.word.noun(),
      created_at: shoppingList?.created_at,
      user_id: userId,
    },
  });
};
