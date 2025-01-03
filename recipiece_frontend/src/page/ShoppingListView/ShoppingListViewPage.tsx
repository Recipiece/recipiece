import { Edit, Eraser, Minus, MoreVertical, Share, Trash } from "lucide-react";
import React, { createRef, FC, KeyboardEvent, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDeleteShoppingListMutation, useGetShoppingListByIdQuery, useShoppingListItemsSubscription } from "../../api";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  H2,
  Input,
  LoadingGroup,
  Popover,
  PopoverContent,
  PopoverTrigger,
  RecipieceMenuBarContext,
  Shelf,
  ShelfSpacer,
  Stack,
  useToast,
} from "../../component";
import { DialogContext } from "../../context";
import { ShoppingList, ShoppingListItem } from "../../data";
import { CheckableShoppingListItemInput } from "./ShoppingListItemInput";
import { useLayout } from "../../hooks";
import { createPortal } from "react-dom";

export const ShoppingListViewPage: FC = () => {
  const { shoppingListId } = useParams();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isMobile } = useLayout();
  const { mobileMenuPortalRef } = useContext(RecipieceMenuBarContext);
  const { pushDialog, popDialog } = useContext(DialogContext);

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
    deleteItem,
    clearItems,
    setItemNotes,
  } = useShoppingListItemsSubscription(+shoppingListId!);

  const { mutateAsync: deleteShoppingList } = useDeleteShoppingListMutation({
    onSuccess: () => {
      toast({
        title: "Shopping List Deleted",
        description: "Your shopping list has been deleted.",
      });
    },
    onFailure: () => {
      toast({
        title: "Error Deleting Shopping List",
        description: "The shopping list could not be deleted. Try again later.",
        variant: "destructive",
      });
    },
  });

  const [newestShoppingListItem, setNewestShoppingListItem] = useState("");
  const [isAutoCompleteOpen, setIsAutoCompleteOpen] = useState(false);
  const [incompleteItems, setIncompleteItems] = useState<{ readonly [key: number]: ShoppingListItem }>({});
  const newItemRef = createRef<HTMLInputElement>();

  useEffect(() => {
    setIncompleteItems(
      shoppingListItems
        .filter((item) => !item.completed)
        .reduce((curr, prev) => {
          return {
            ...curr,
            [prev.id]: prev,
          };
        }, {})
    );
  }, [shoppingListItems]);

  const sortedIncompleteItems = useMemo(() => {
    return Object.values(incompleteItems).sort((a, b) => a.order - b.order);
  }, [incompleteItems]);

  const onChangeItemContent = useCallback(
    (item: ShoppingListItem) => {
      setItemContent({
        ...item,
      });
    },
    [setItemContent]
  );

  const onChangeItemContentKeyDown = useCallback(
    (event: KeyboardEvent, item: ShoppingListItem) => {
      if (event.key === "Enter") {
        onChangeItemContent(item);
      }
    },
    [onChangeItemContent]
  );

  const onChangeItemValue = useCallback((event: React.ChangeEvent<HTMLInputElement>, itemId: number) => {
    setIncompleteItems((prev) => {
      return {
        ...prev,
        [itemId]: { ...prev[itemId], content: event.target.value },
      };
    });
  }, []);

  const onChangeItemNotes = useCallback(
    (item: ShoppingListItem) => {
      setItemNotes({
        ...item,
      });
    },
    [setItemNotes]
  );

  const onChangeItemNotesKeyDown = useCallback(
    (event: KeyboardEvent, item: ShoppingListItem) => {
      if (event.key === "Enter") {
        onChangeItemNotes(item);
      }
    },
    [onChangeItemNotes]
  );

  const onChangeNotesValue = useCallback((event: React.ChangeEvent<HTMLInputElement>, itemId: number) => {
    setIncompleteItems((prev) => {
      return {
        ...prev,
        [itemId]: { ...prev[itemId], notes: event.target.value },
      };
    });
  }, []);

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

  const onDeleteItem = useCallback(
    (item: ShoppingListItem) => {
      deleteItem({ ...item });
    },
    [deleteItem]
  );

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

  const onRequestShoppingListDelete = useCallback(() => {
    pushDialog("deleteShoppingList", {
      onClose: () => popDialog("deleteShoppingList"),
      onSubmit: async (list: ShoppingList) => {
        try {
          await deleteShoppingList(list.id);
          navigate("/");
        } catch {
          // noop
        } finally {
          popDialog("deleteShoppingList");
        }
      },
      shoppingList: shoppingList,
    });
  }, [pushDialog, popDialog, deleteShoppingList, navigate, shoppingList]);

  const contextMenu = useMemo(() => {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="text-primary">
            <MoreVertical />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>
            <Edit /> Edit List Name
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Share /> Share List
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={clearItems} className="text-destructive">
            <Eraser /> Clear All Items
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onRequestShoppingListDelete} className="text-destructive">
            <Trash /> Delete List
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }, [clearItems, onRequestShoppingListDelete]);

  return (
    <Popover open={isAutoCompleteOpen}>
      <Stack>
        <LoadingGroup isLoading={isLoadingShoppingList} className="w-[200px] h-6">
          <Shelf>
            <H2>{shoppingList?.name}</H2>
            <ShelfSpacer />
            {shoppingList && (
              <>
                {(isMobile && mobileMenuPortalRef && mobileMenuPortalRef.current) && createPortal(contextMenu, mobileMenuPortalRef.current)}
                {!isMobile && <>{contextMenu}</>}
              </>
            )}
          </Shelf>
        </LoadingGroup>
        <LoadingGroup variant="spinner" isLoading={isLoadingShoppingList || isLoadingShoppingListItems || isLoadingShoppingListItems} className="w-9 h-9">
          <div className="p-2">
            <Stack>
              <div className="flex-col">
                <div className="w-full inline-flex flex-row gap-4">
                  <Input
                    ref={newItemRef}
                    disabled={isPerformingAction}
                    className="border-y-0 border-b-[1px] border-l-[1px] border-r-0 w-full p-1 rounded-none ring-0 outline-none focus-visible:ring-0 focus-visible:outline-none rounded-bl-md"
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
              <div className="grid grid-cols-1 gap-4">
                {sortedIncompleteItems.map((item) => {
                  return (
                    <div className="inline-flex flex-row gap-2 w-full items-center" key={item.id}>
                      <CheckableShoppingListItemInput
                        className="flex-grow"
                        isDraggable
                        shoppingListItem={item}
                        disabled={isPerformingAction}
                        onCheck={markItemComplete}
                        onContentBlurred={() => onChangeItemContent(item)}
                        onContentKeyDown={(event) => onChangeItemContentKeyDown(event, item)}
                        onContentChanged={(event) => onChangeItemValue(event, item.id)}
                        onItemDropped={onShoppingListItemDropped}
                        onNotesBlurred={() => onChangeItemNotes(item)}
                        onNotesChanged={(event) => onChangeNotesValue(event, item.id)}
                        onNotesKeyDown={(event) => onChangeItemNotesKeyDown(event, item)}
                      />
                      <Button onClick={() => onDeleteItem(item)} variant="ghost">
                        <Minus className="text-destructive" />
                      </Button>
                    </div>
                  );
                })}
              </div>

              {completeShoppingListItems.length > 0 && <hr />}

              {completeShoppingListItems.map((item) => {
                return (
                  <div key={item.id} className="flex flex-row gap-2 opacity-70 items-center">
                    <CheckableShoppingListItemInput disabled={isPerformingAction} shoppingListItem={item} onCheck={markItemIncomplete} readOnly />
                    <Button onClick={() => onDeleteItem(item)} variant="ghost">
                      <Minus className="text-destructive" />
                    </Button>
                  </div>
                );
              })}
            </Stack>
          </div>
        </LoadingGroup>
      </Stack>
    </Popover>
  );
};
