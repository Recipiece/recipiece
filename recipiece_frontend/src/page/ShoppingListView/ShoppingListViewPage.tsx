import { ShoppingListItemSchema, ShoppingListSchema, UserKitchenMembershipSchema } from "@recipiece/types";
import { Edit, Eraser, Minus, MoreVertical, Share, Trash } from "lucide-react";
import React, { createRef, FC, KeyboardEvent, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useParams } from "react-router-dom";
import { useCreateShoppingListShareMutation, useDeleteShoppingListMutation, useGetSelfQuery, useGetShoppingListByIdQuery, useShoppingListItemsSubscription } from "../../api";
import {
  Button,
  Divider,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  H2,
  Input,
  LoadingGroup,
  LoadingSpinner,
  Popover,
  PopoverContent,
  PopoverTrigger,
  RecipieceMenuBarContext,
  Stack,
  useToast,
} from "../../component";
import { DialogContext } from "../../context";
import { useLayout } from "../../hooks";
import { CheckableShoppingListItemInput } from "./ShoppingListItemInput";

export const ShoppingListViewPage: FC = () => {
  const { shoppingListId } = useParams();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isMobile } = useLayout();
  const { mobileMenuPortalRef } = useContext(RecipieceMenuBarContext);
  const { pushDialog, popDialog } = useContext(DialogContext);

  const { data: user } = useGetSelfQuery();
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

  const { mutateAsync: deleteShoppingList } = useDeleteShoppingListMutation();
  const { mutateAsync: createShoppingListShare } = useCreateShoppingListShareMutation();

  const [newestShoppingListItem, setNewestShoppingListItem] = useState("");
  const [isAutoCompleteOpen, setIsAutoCompleteOpen] = useState(false);
  const [incompleteItems, setIncompleteItems] = useState<{ readonly [key: number]: ShoppingListItemSchema }>({});
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
    (item: ShoppingListItemSchema) => {
      setItemContent({
        ...item,
      });
    },
    [setItemContent]
  );

  const onChangeItemContentKeyDown = useCallback(
    (event: KeyboardEvent, item: ShoppingListItemSchema) => {
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
    (item: ShoppingListItemSchema) => {
      setItemNotes({
        ...item,
      });
    },
    [setItemNotes]
  );

  const onChangeItemNotesKeyDown = useCallback(
    (event: KeyboardEvent, item: ShoppingListItemSchema) => {
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
    (item: ShoppingListItemSchema, intoSpot: number) => {
      setItemOrder({
        ...item,
        order: intoSpot,
      });
    },
    [setItemOrder]
  );

  const onSelectAutocompleteItem = useCallback(
    (item: ShoppingListItemSchema) => {
      markItemIncomplete(item);
      setNewestShoppingListItem("");
    },
    [markItemIncomplete]
  );

  const onNewestItemTextChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setNewestShoppingListItem(event.target.value);
  }, []);

  const onDeleteItem = useCallback(
    (item: ShoppingListItemSchema) => {
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
      onSubmit: async (list: ShoppingListSchema) => {
        try {
          await deleteShoppingList(list);
          toast({
            title: "Shopping List Deleted",
            description: "Your shopping list has been deleted.",
          });
          navigate("/");
        } catch {
          toast({
            title: "Error Deleting Shopping List",
            description: "The shopping list could not be deleted. Try again later.",
            variant: "destructive",
          });
        } finally {
          popDialog("deleteShoppingList");
        }
      },
      shoppingList: shoppingList,
    });
  }, [pushDialog, shoppingList, popDialog, deleteShoppingList, toast, navigate]);

  const onShareList = useCallback(() => {
    pushDialog("share", {
      displayName: shoppingList!.name,
      entity_id: shoppingList!.id,
      entity_type: "shopping_list",
      onClose: () => popDialog("share"),
      onSubmit: async (membership: UserKitchenMembershipSchema) => {
        try {
          await createShoppingListShare({
            shopping_list_id: shoppingList!.id,
            user_kitchen_membership_id: membership.id,
          });
          const username = membership.source_user.id === user!.id ? membership.destination_user.username : membership.source_user.username;
          toast({
            title: "Shopping List Shared",
            description: `Your shopping list has been shared with ${username}`,
          });
        } catch {
          toast({
            title: "Unable to Share Shopping List",
            description: "Your shopping list could not be shared. Try again later.",
          });
        } finally {
          popDialog("share");
        }
      },
    });
  }, [createShoppingListShare, popDialog, pushDialog, shoppingList, toast, user]);

  const contextMenu = useMemo(() => {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="text-primary">
            <MoreVertical />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {shoppingList?.user_id === user?.id && (
            <DropdownMenuItem>
              <Edit /> Edit List Name
            </DropdownMenuItem>
          )}
          {shoppingList?.user_id === user?.id && (
            <DropdownMenuItem onClick={onShareList}>
              <Share /> Share List
            </DropdownMenuItem>
          )}
          {shoppingList?.user_id === user?.id && <DropdownMenuSeparator />}
          <DropdownMenuItem onClick={clearItems} className="text-destructive">
            <Eraser /> Clear All Items
          </DropdownMenuItem>
          {shoppingList?.user_id === user?.id && (
            <DropdownMenuItem onClick={onRequestShoppingListDelete} className="text-destructive">
              <Trash /> Delete List
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }, [clearItems, onRequestShoppingListDelete, onShareList, shoppingList, user]);

  return (
    <Popover open={isAutoCompleteOpen}>
      <Stack>
        <LoadingGroup isLoading={isLoadingShoppingList} className="h-6 w-[200px]">
          <div className="flex flex-row gap-2">
            <H2 className="flex-grow">{shoppingList?.name}</H2>
            {shoppingList && (
              <>
                {isMobile && mobileMenuPortalRef && mobileMenuPortalRef.current && createPortal(contextMenu, mobileMenuPortalRef.current)}
                {!isMobile && <>{contextMenu}</>}
              </>
            )}
          </div>
        </LoadingGroup>
        <div className="p-2">
          <Stack>
            <div className="flex-col">
              <div className="inline-flex w-full flex-row gap-4">
                <Input
                  ref={newItemRef}
                  disabled={isPerformingAction}
                  className="w-full rounded-none rounded-bl-md border-y-0 border-b-[1px] border-l-[1px] border-r-0 p-1 outline-none ring-0 focus-visible:outline-none focus-visible:ring-0"
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
                  className="min-w-[200px] p-1"
                  side="bottom"
                  sideOffset={-14}
                  onOpenAutoFocus={(event) => event.preventDefault()}
                  onCloseAutoFocus={(event) => event.preventDefault()}
                  avoidCollisions={false}
                >
                  <div className="grid grid-cols-1">
                    {autocompleteSuggestions.map((item) => {
                      return (
                        <Button className="h-auto justify-start p-1" variant="ghost" key={item.id} onClick={() => onSelectAutocompleteItem(item)}>
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
                  <div className="inline-flex w-full flex-row items-center gap-2" key={item.id}>
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

            {completeShoppingListItems.length > 0 && <Divider />}

            {completeShoppingListItems.map((item) => {
              return (
                <div key={item.id} className="flex flex-row items-center gap-2 opacity-70">
                  <CheckableShoppingListItemInput disabled={isPerformingAction} shoppingListItem={item} onCheck={markItemIncomplete} readOnly />
                  <Button onClick={() => onDeleteItem(item)} variant="ghost">
                    <Minus className="text-destructive" />
                  </Button>
                </div>
              );
            })}
          </Stack>
        </div>
        {isLoadingShoppingListItems && (
          <div className="fixed bottom-16 right-0 p-2 sm:bottom-0">
            <LoadingSpinner width={40} height={40} />
          </div>
        )}
      </Stack>
    </Popover>
  );
};
