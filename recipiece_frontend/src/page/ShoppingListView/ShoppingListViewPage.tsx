import { createRef, FC, KeyboardEvent, useCallback, useEffect, useMemo, useState } from "react";
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
    isPerformingAction,
    addItem,
    markItemComplete,
    markItemIncomplete,
    setItemOrder,
    setItemContent,
  } = useShoppingListItemsSubscription(+shoppingListId!);

  const [newestShoppingListItem, setNewestShoppingListItem] = useState("");
  const [isAutoCompleteOpen, setIsAutoCompleteOpen] = useState(false);
  const [incompleteItems, setIncompleteItems] = useState<ShoppingListItem[]>([]);
  const newItemRef = createRef<HTMLInputElement>();

  useEffect(() => {
    setIncompleteItems(shoppingListItems.filter((item) => !item.completed));
  }, [shoppingListItems]);

  const onChangeItemContent = useCallback(
    (item: ShoppingListItem) => {
      setItemContent({
        ...item,
      });
    },
    [setItemContent]
  );

  const onChangeItemKeyDown = useCallback(
    (event: KeyboardEvent, item: ShoppingListItem) => {
      if (event.key === "Enter") {
        onChangeItemContent(item);
      }
    },
    [onChangeItemContent]
  );

  // const onChangeItem = useCallback((event: React.ChangeEvent<HTMLInputElement>, item: ShoppingListItem) => {

  //   // setUpdatingIncompleteItem({ ...item, content: event.target.value });

  //   // setIncompleteItems((prev) => {
  //   //   return prev.map((previousItem) => {
  //   //     if (item.id === previousItem.id) {
  //   //       return {
  //   //         ...previousItem,
  //   //         content: event.target.value,
  //   //       };
  //   //     } else {
  //   //       return { ...previousItem };
  //   //     }
  //   //   });
  //   // });
  // }, []);

  // /**
  //  * Handle the debounced item update when you're making a change
  //  */
  // useEffect(() => {
  //   const timeout = setTimeout(() => {
  //     if (updatingIncompleteItem && updatingIncompleteItem.content.trim().length > 1) {
  //       setItemContent({ ...updatingIncompleteItem });
  //       setUpdatingIncompleteItem(undefined);
  //     }
  //   }, 3000);

  //   return () => {
  //     clearTimeout(timeout);
  //   };
  // // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [updatingIncompleteItem]);

  const onAddItem = useCallback(() => {
    if (newestShoppingListItem.trim().length > 1) {
      addItem({
        order: shoppingListItems.length,
        completed: false,
        content: newestShoppingListItem,
      });

      setNewestShoppingListItem("");
    }
  }, [newestShoppingListItem, addItem, shoppingListItems]);

  const onNewItemKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        onAddItem();
      }
    },
    [onAddItem]
  );

  const completeShoppingListItems = useMemo(() => {
    return shoppingListItems.filter((listItem) => {
      return listItem.completed;
    });
  }, [shoppingListItems]);

  const onShoppingListItemDropped = useCallback(
    (item: ShoppingListItem, intoSpot: number) => {
      setItemOrder({
        ...item,
        order: intoSpot,
      });
    },
    [setItemOrder]
  );

  const onSelectAutocompleteItem = useCallback(
    (item: ShoppingListItem) => {
      markItemIncomplete(item);
      setNewestShoppingListItem("");
    },
    [markItemIncomplete]
  );

  const onNewestItemTextChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setNewestShoppingListItem(event.target.value);
  }, []);

  const autocompleteSuggestions = useMemo(() => {
    return shoppingListItems
      .filter((item) => item.completed)
      .filter((item) => {
        return item.content.toLowerCase().includes(newestShoppingListItem.toLowerCase()) && item.content.toLowerCase() !== newestShoppingListItem.toLowerCase();
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newestShoppingListItem, autocompleteSuggestions.length]);

  return (
    <Popover open={isAutoCompleteOpen}>
      <Stack>
        <LoadingGroup isLoading={isLoadingShoppingList} className="w-[200px] h-6">
          <Shelf>
            <h1 className="text-xl">{shoppingList?.name}</h1>
          </Shelf>
        </LoadingGroup>
        <LoadingGroup variant="spinner" isLoading={isLoadingShoppingList || isLoadingShoppingListItems || isLoadingShoppingListItems} className="w-9 h-9">
          <div className="p-2">
            <Stack>
              <div className="grid grid-cols-1 gap-4">
                {incompleteItems.map((item) => {
                  return (
                    <div className="inline-flex flex-row gap-2 w-full" key={item.id}>
                      <CheckableShoppingListItemInput
                        id={item.id.toString()}
                        className="flex-grow"
                        isDraggable
                        shoppingListItem={item}
                        disabled={isPerformingAction}
                        value={item.content}
                        onCheck={markItemComplete}
                        onBlur={() => onChangeItemContent(item)}
                        onKeyDown={(event) => onChangeItemKeyDown(event, item)}
                        // onChange={(event) => onChangeItem(event, item)}
                        onItemDropped={onShoppingListItemDropped}
                      />
                      {/* <Button onClick={() => onDeleteItem(item)} variant="ghost">
                        <Trash size={12} className="text-destructive" />
                      </Button> */}
                    </div>
                  );
                })}
              </div>
              <div className="flex-col">
                <div className="w-full inline-flex flex-row gap-4">
                  <ShoppingListItemInput
                    ref={newItemRef}
                    disabled={isPerformingAction}
                    className="flex-grow"
                    placeholder="Add an item..."
                    value={newestShoppingListItem}
                    onChange={onNewestItemTextChange}
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
                    alignOffset={-16}
                    align="start"
                    className="p-1 min-w-[200px]"
                    side="bottom"
                    sideOffset={-14}
                    onOpenAutoFocus={(event) => event.preventDefault()}
                    onCloseAutoFocus={(event) => event.preventDefault()}
                    avoidCollisions={false}
                  >
                    <div className="grid grid-cols-1">
                      {autocompleteSuggestions.map((item) => {
                        return (
                          <Button className="justify-start p-1 h-auto" variant="ghost" key={item.id} onClick={() => onSelectAutocompleteItem(item)}>
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
                return (
                  <CheckableShoppingListItemInput disabled={isPerformingAction} key={item.id} shoppingListItem={item} onCheck={markItemIncomplete} value={item.content} readOnly />
                );
              })}
            </Stack>
          </div>
        </LoadingGroup>
      </Stack>
    </Popover>
  );
};
