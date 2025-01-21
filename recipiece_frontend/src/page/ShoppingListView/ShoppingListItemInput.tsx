import { ShoppingListItemSchema } from "@recipiece/types";
import { Grip } from "lucide-react";
import mergeRefs from "merge-refs";
import { ChangeEvent, FC, useMemo, useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import { Checkbox, Input } from "../../component";
import { useLayout } from "../../hooks";
import { cn } from "../../util";

export interface CheckableShoppingListItemInputProps {
  readonly onCheck: (item: ShoppingListItemSchema) => void;
  readonly shoppingListItem: ShoppingListItemSchema;
  readonly isDraggable?: boolean;
  readonly onItemDropped?: (item: ShoppingListItemSchema, intoSpot: number) => void;
  readonly disabled?: boolean;
  readonly className?: string;
  readonly readOnly?: boolean;

  readonly onContentChanged?: (event: ChangeEvent<HTMLInputElement>) => void;
  readonly onNotesChanged?: (event: ChangeEvent<HTMLInputElement>) => void;
  readonly onContentBlurred?: (event: ChangeEvent<HTMLInputElement>) => void;
  readonly onNotesBlurred?: (event: ChangeEvent<HTMLInputElement>) => void;
  readonly onContentKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  readonly onNotesKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
}

export const SHOPPING_LIST_ITEM_INPUT_CLASSES = [
  "outline-none",
  "ring-0",
  "border-none",
  "rounded-none",
  "p-1",
  "h-auto",
  "ring-offset-0",
  "focus-visible:ring-0",
  "focus-visible:outline-none",
  "focus-within:ring-0",
  "focus-within:outline-none",
];

export const CheckableShoppingListItemInput: FC<CheckableShoppingListItemInputProps> = ({
  shoppingListItem,
  onCheck,
  isDraggable,
  onItemDropped,
  disabled,
  onContentBlurred,
  onContentChanged,
  onNotesBlurred,
  onNotesChanged,
  onContentKeyDown,
  onNotesKeyDown,
  readOnly,
}) => {
  const { isMobile } = useLayout();
  const [isContentDirty, setIsContentDirty] = useState(false);
  const [isNotesDirty, setIsNotesDirty] = useState(false);

  const [{ isDragging }, dragRef, draggingRef] = useDrag(() => {
    return {
      type: "shopping_list_item",
      item: { ...shoppingListItem },
      collect: (monitor) => {
        return {
          isDragging: !!monitor.isDragging(),
        };
      },
    };
  }, [shoppingListItem]);

  const [{ isOver }, dropRef] = useDrop(() => {
    return {
      accept: "shopping_list_item",
      drop: (droppedItem) => {
        onItemDropped?.(droppedItem as ShoppingListItemSchema, shoppingListItem.order);
      },
      collect: (monitor) => {
        return {
          isOver: monitor.isOver(),
        };
      },
    };
  }, [shoppingListItem]);

  const wrapperClassName = useMemo(() => {
    const baseClassName = "inline-flex flex-row items-center gap-2 flex-grow";
    if (isOver) {
      return cn(baseClassName, "border-t-primary border-t-solid border-t-2");
    } else {
      return cn(baseClassName);
    }
  }, [isOver]);

  const draggingView = useMemo(() => {
    return <div className="h-6 w-full" ref={draggingRef} />;
  }, [draggingRef]);

  const outerRef = useMemo(() => {
    if (isDraggable) {
      if (isMobile) {
        return dropRef;
      } else {
        return mergeRefs(dragRef, dropRef);
      }
    }
    return null;
  }, [isDraggable, isMobile, dragRef, dropRef]);

  const innerRef = useMemo(() => {
    if (isDraggable && isMobile) {
      return dragRef;
    }
    return null;
  }, [isDraggable, isMobile, dragRef]);

  const nonDraggingView = (
    // @ts-ignore
    <div className={wrapperClassName} ref={outerRef}>
      {isDraggable && <Grip ref={innerRef} />}
      <Checkbox disabled={disabled} checked={shoppingListItem.completed} onClick={() => onCheck(shoppingListItem)} />
      <div className="border-y-0 border-b-[1px] border-l-[1px] border-r-0 w-full p-1 rounded-bl-md">
        <Input
          type="text"
          placeholder="what do you need to get?"
          className={cn(...SHOPPING_LIST_ITEM_INPUT_CLASSES)}
          disabled={disabled}
          value={shoppingListItem.content}
          onChange={(event) => {
            if (event.target.value.length) {
              setIsContentDirty(true);
              onContentChanged?.(event);
            }
          }}
          onBlur={(event) => {
            if (isContentDirty) {
              onContentBlurred?.(event);
            }
            setIsContentDirty(false);
          }}
          onKeyDown={(event) => {
            onContentKeyDown?.(event);
            setIsContentDirty(false);
          }}
          readOnly={readOnly}
        />
        <Input
          type="text"
          placeholder="anything to note?"
          className={cn(...SHOPPING_LIST_ITEM_INPUT_CLASSES, "text-xs")}
          disabled={disabled}
          value={shoppingListItem.notes ?? ""}
          onChange={(event) => {
            setIsNotesDirty(true);
            onNotesChanged?.(event);
          }}
          onBlur={(event) => {
            if (isNotesDirty) {
              onNotesBlurred?.(event);
            }
            setIsNotesDirty(false);
          }}
          onKeyDown={(event) => {
            onNotesKeyDown?.(event);
            setIsNotesDirty(false);
          }}
          readOnly={readOnly}
        />
      </div>
    </div>
  );

  return isDragging ? draggingView : nonDraggingView;
};
