import { Grip } from "lucide-react";
import { FC, Ref, useMemo } from "react";
import { useDrag, useDrop } from "react-dnd";
import { Checkbox, Input, InputProps } from "../../component";
import { ShoppingListItem } from "../../data";
import { cn } from "../../util";
import mergeRefs from "merge-refs";
import { useLayout } from "../../hooks";

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

export const ShoppingListItemInput: FC<InputProps & {readonly ref?: Ref<HTMLInputElement>}> = ({ className, ref, ...restProps }) => {
  return <Input ref={ref} className={cn(...SHOPPING_LIST_ITEM_INPUT_CLASSES, className)} {...restProps} />;
};

export const CheckableShoppingListItemInput: FC<CheckableShoppingListItemInputProps> = ({ shoppingListItem, onCheck, isDraggable, onItemDropped, disabled, ...restProps }) => {
  const { isMobile } = useLayout();

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
        };
      },
    };
  }, [shoppingListItem]);

  const wrapperClassName = useMemo(() => {
    const baseClassName = "inline-flex flex-row items-center gap-4 flex-grow";
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
    if(isDraggable) {
      if(isMobile) {
        return dropRef;
      } else {
        return mergeRefs(dragRef, dropRef);
      }
    }
    return null;
  }, [isDraggable, isMobile, dragRef, dropRef]);

  const innerRef = useMemo(() => {
    if(isDraggable && isMobile) {
      return dragRef;
    }
    return null;
  }, [isDraggable, isMobile, dragRef]);

  const nonDraggingView = (
    // @ts-ignore
    <div className={wrapperClassName} ref={outerRef}>
      {isDraggable && <Grip ref={innerRef} />}
      <Checkbox disabled={disabled} checked={shoppingListItem.completed} onClick={() => onCheck(shoppingListItem)} />
      <ShoppingListItemInput disabled={disabled} {...restProps} />
    </div>
  );

  return isDragging ? draggingView : nonDraggingView;
};
