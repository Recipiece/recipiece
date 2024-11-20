import { FC, KeyboardEvent, useCallback, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useGetShoppingListByIdQuery, useRequestShoppingListSessionQuery, useShoppingListItemsSubscription } from "../../api";
import { Checkbox, LoadingGroup, Shelf, Stack } from "../../component";
import { ShoppingListItem } from "../../data";
import { ShoppingListItemInput } from "./ShoppingListItemInput";

export const ShoppingListViewPage: FC = () => {
  const { shoppingListId } = useParams();
  const { data: shoppingList, isLoading: isLoadingShoppingList } = useGetShoppingListByIdQuery(+shoppingListId!);
  const { data: wsSession, isLoading: isLoadingWsSession } = useRequestShoppingListSessionQuery(+shoppingListId!);
  const { shoppingListItems, isLoading: isLoadingShoppingListItems, addItem, markItemComplete } = useShoppingListItemsSubscription(wsSession?.token);

  const [newestShoppingListItem, setNewestShoppingListItem] = useState("");

  const onAddItem = useCallback(() => {
    addItem({
      order: shoppingListItems.length,
      completed: false,
      content: newestShoppingListItem,
    });
    setNewestShoppingListItem("");
  }, [newestShoppingListItem, addItem, shoppingListItems]);

  const onNewItemKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        onAddItem();
      }
    },
    [onAddItem]
  );

  const onCompleteItem = useCallback((item: ShoppingListItem) => {
    markItemComplete(item);
  }, [markItemComplete]);

  const incompleteShoppingListItems = useMemo(() => {
    return shoppingListItems.filter((listItem) => {
      return !listItem.completed;
    });
  }, [shoppingListItems]);

  const completeShoppingListItems = useMemo(() => {
    return shoppingListItems.filter((listItem) => {
      return listItem.completed;
    });
  }, [shoppingListItems]);

  return (
    <Stack>
      <LoadingGroup isLoading={isLoadingShoppingList || isLoadingWsSession} className="w-[250px] h-5">
        <Shelf>
          <h1 className="text-xl">{shoppingList?.name}</h1>
        </Shelf>
      </LoadingGroup>
      {incompleteShoppingListItems.map((item) => {
        return (
          <div key={item.id} className="inline-flex justify-start gap-1 items-center">
            <Checkbox onClick={() => onCompleteItem(item)}/> <ShoppingListItemInput value={item.content} />
          </div>
        );
      })}
      <ShoppingListItemInput value={newestShoppingListItem} onChange={(event) => setNewestShoppingListItem(event.target.value)} onKeyDown={onNewItemKeyDown} />

      <hr />

      {completeShoppingListItems.map((item) => {
        return (
          <div key={item.id} className="inline-flex flex-row justify-start gap-1 items-center">
            <Checkbox value={"false"} onChange={() => onCompleteItem(item)} />
            <p className="line-through">{item.content}</p>
          </div>
        );
      })}
    </Stack>
  );
};
