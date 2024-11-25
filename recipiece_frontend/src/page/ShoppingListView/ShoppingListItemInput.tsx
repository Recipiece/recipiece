import { Grip } from "lucide-react";
import { FC, useMemo } from "react";
import { useDrag, useDrop } from "react-dnd";
import { Checkbox, Input, InputProps } from "../../component";
import { ShoppingListItem } from "../../data";
import { cn } from "../../util";
import mergeRefs from "merge-refs";

export interface CheckableShoppingListItemInputProps extends InputProps {
  readonly onCheck: (item: ShoppingListItem) => void;
  readonly shoppingListItem: ShoppingListItem;
  readonly isDraggable?: boolean;
  readonly onItemDropped?: (item: ShoppingListItem, intoSpot: number) => void;
}

export const SHOPPING_LIST_ITEM_INPUT_CLASSES = [
  "outline-none",
  "ring-0",
  "border-y-0",
  "border-b-[1px]",
  "border-r-0",
  "rounded-t-none",
  "rounded-br-none",
  "rounded-bl-md",
  "p-1",
  "h-auto",
  "focus-visible:ring-0",
];

export const ShoppingListItemInput: FC<InputProps> = ({ className, ...restProps }) => {
  return (
    <Input
      className={cn(...SHOPPING_LIST_ITEM_INPUT_CLASSES, className)}
      {...restProps}
    />
  );
};

export const CheckableShoppingListItemInput: FC<CheckableShoppingListItemInputProps> = ({ shoppingListItem, onCheck, isDraggable, onItemDropped, ...restProps }) => {
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
        onItemDropped?.(droppedItem as ShoppingListItem, shoppingListItem.order);
      },
      collect: (monitor) => {
        return {
          isOver: monitor.isOver(),
        }
      }
    };
  }, [shoppingListItem]);

  const wrapperClassName = useMemo(() => {
    const baseClassName = "inline-flex flex-row items-center gap-2 flex-grow";
    if(isOver) {
      return cn(baseClassName, "border-t-primary border-t-solid border-t-[1px]");
    } else {
      return cn(baseClassName);
    }
  }, [isOver]);

  const draggingView = useMemo(() => {
    return <div className="h-6 w-full" ref={draggingRef} />;
  }, [draggingRef]);

  const nonDraggingView = (
    // @ts-ignore
    <div className={wrapperClassName} ref={isDraggable ? mergeRefs(dragRef, dropRef) : null}>
      {isDraggable && <Grip />}
      <Checkbox checked={shoppingListItem.completed} onClick={() => onCheck(shoppingListItem)} />
      <ShoppingListItemInput {...restProps} />
    </div>
  );

  return isDragging ? draggingView : nonDraggingView;
};
