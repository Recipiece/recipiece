import { Trash } from "lucide-react";
import { FC, KeyboardEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useGetShoppingListByIdQuery, useShoppingListItemsSubscription } from "../../api";
import { Button, LoadingGroup, Popover, PopoverContent, PopoverTrigger, Shelf, Stack } from "../../component";
import { ShoppingListItem } from "../../data";
import { CheckableShoppingListItemInput, ShoppingListItemInput } from "./ShoppingListItemInput";

export const ShoppingListViewPage: FC = () => {
  const { shoppingListId } = useParams();
  const { data: shoppingList, isLoading: isLoadingShoppingList } = useGetShoppingListByIdQuery(+shoppingListId!);
  const {
    shoppingListItems,
    isLoading: isLoadingShoppingListItems,
    addItem,
    markItemComplete,
    deleteItem,
    markItemIncomplete,
    setItemOrder,
  } = useShoppingListItemsSubscription(+shoppingListId!);

  const [newestShoppingListItem, setNewestShoppingListItem] = useState("");
  const [isAutoCompleteOpen, setIsAutoCompleteOpen] = useState(false);

  const onChangeItem = useCallback((item: ShoppingListItem) => {}, []);

  const onDeleteItem = useCallback(
    (item: ShoppingListItem) => {
      deleteItem({ ...item });
    },
    [deleteItem]
  );

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

  const onShoppingListItemDropped = useCallback((item: ShoppingListItem, intoSpot: number) => {
    setItemOrder({
      ...item,
      order: intoSpot,
    })
  }, [setItemOrder]);

  const autocompleteSuggestions = useMemo(() => {
    return shoppingListItems
      .filter((item) => item.completed)
      .filter((item) => {
        return item.content.toLowerCase().includes(newestShoppingListItem) && item.content.toLowerCase() !== newestShoppingListItem.toLowerCase();
      });
  }, [shoppingListItems, newestShoppingListItem]);

  useEffect(() => {
    if (autocompleteSuggestions.length === 0) {
      setIsAutoCompleteOpen(false);
    } else {
      if (newestShoppingListItem.length > 2 && !isAutoCompleteOpen) {
        setIsAutoCompleteOpen(autocompleteSuggestions.length > 0 && newestShoppingListItem.length > 1);
      } else if (newestShoppingListItem.length <= 2 && isAutoCompleteOpen) {
        setIsAutoCompleteOpen(false);
      }
    }
  }, [newestShoppingListItem, autocompleteSuggestions.length]);

  return (
    <Popover open={isAutoCompleteOpen}>
      <Stack>
        <LoadingGroup isLoading={isLoadingShoppingList} className="w-[250px] h-6">
          <Shelf>
            <h1 className="text-xl">{shoppingList?.name}</h1>
          </Shelf>
        </LoadingGroup>
        <LoadingGroup variant="spinner" isLoading={isLoadingShoppingList || isLoadingShoppingListItems || isLoadingShoppingListItems} className="w-9 h-9">
          <div>
            {incompleteShoppingListItems.map((item) => {
              return (
                <div className="inline-flex flex-row gap-2 w-full" key={item.id}>
                  <CheckableShoppingListItemInput
                    className="flex-grow"
                    isDraggable
                    shoppingListItem={item}
                    value={item.content}
                    onCheck={markItemComplete}
                    onChange={() => onChangeItem(item)}
                    onItemDropped={onShoppingListItemDropped}
                  />
                  <Button onClick={() => onDeleteItem(item)} variant="ghost">
                    <Trash size={12} className="text-destructive" />
                  </Button>
                </div>
              );
            })}
          </div>
          <div className="flex-col">
            <div className="w-full inline-flex flex-row gap-2">
              <ShoppingListItemInput
                className="flex-grow"
                placeholder="Add an item..."
                value={newestShoppingListItem}
                onChange={(event) => setNewestShoppingListItem(event.target.value)}
                onKeyDown={onNewItemKeyDown}
                onBlur={() => setIsAutoCompleteOpen(false)}
                onFocus={() => setIsAutoCompleteOpen(autocompleteSuggestions.length > 0 && newestShoppingListItem.length > 1)}
              />
              <Button variant="outline" onClick={onAddItem}>
                Add Item
              </Button>
            </div>
            <div className="ml-4 h-0 w-0">
              <PopoverTrigger className="h-0 w-0" />
              <PopoverContent
                alignOffset={-14}
                align="start"
                className="p-1 w-full"
                side="bottom"
                sideOffset={-14}
                onOpenAutoFocus={(event) => event.preventDefault()}
                onCloseAutoFocus={(event) => event.preventDefault()}
                avoidCollisions={false}
              >
                <div className="grid grid-cols-1">
                  {autocompleteSuggestions.map((item) => {
                    return (
                      <Button className="justify-start p-1 h-auto" variant="ghost" key={item.id} onClick={() => setNewestShoppingListItem(item.content)}>
                        {item.content}
                      </Button>
                    );
                  })}
                </div>
              </PopoverContent>
            </div>
          </div>

          <hr />

          {completeShoppingListItems.map((item) => {
            return <CheckableShoppingListItemInput key={item.id} shoppingListItem={item} onCheck={markItemIncomplete} value={item.content} readOnly />;
          })}
        </LoadingGroup>
      </Stack>
    </Popover>
  );
};
