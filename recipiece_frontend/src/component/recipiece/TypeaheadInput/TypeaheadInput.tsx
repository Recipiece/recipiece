import { DataTestId } from "@recipiece/constant";
import { FC, useCallback, useEffect, useState } from "react";
import { cn } from "../../../util";
import { Button, Input, InputProps, LoadingSpinner, Popover, PopoverContent, PopoverTrigger } from "../../shadcn";

export interface TypeaheadInputProps extends InputProps {
  readonly autocompleteOptions: string[];
  readonly isLoading?: boolean;
  readonly onSelectItem: (value: string) => void;
  readonly popoverClassName?: string;
}

export const TypeaheadInput: FC<TypeaheadInputProps> = ({
  autocompleteOptions,
  popoverClassName,
  onSelectItem,
  onFocus,
  onBlur,
  isLoading,
  ...restInputProps
}) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const _onSelectItem = useCallback(
    (item: string) => {
      onSelectItem(item);
      setIsPopoverOpen(false);
    },
    [onSelectItem]
  );

  useEffect(() => {
    setIsPopoverOpen(isFocused && (isLoading || autocompleteOptions.length > 0));
  }, [isFocused, autocompleteOptions, isLoading]);

  //@ts-expect-error data-testid is not well typed
  const dataTestId = restInputProps?.["data-testid"];

  return (
    <Popover open={isPopoverOpen}>
      <div>
        <Input
          onFocus={(event) => {
            setIsFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setIsFocused(false);
            onBlur?.(event);
          }}
          data-testid={dataTestId}
          {...restInputProps}
        />
        <div className="ml-4 h-0 w-0">
          <PopoverTrigger className="h-0 w-0" />
          <PopoverContent
            data-testid={DataTestId.TypeaheadInput.POPOVER_CONTAINER(dataTestId)}
            alignOffset={-16}
            align="start"
            className={cn("p-1", popoverClassName)}
            side="bottom"
            sideOffset={-14}
            onOpenAutoFocus={(event) => event.preventDefault()}
            onCloseAutoFocus={(event) => event.preventDefault()}
            avoidCollisions={false}
          >
            {isLoading && <LoadingSpinner />}
            {!isLoading && (
              <div className="flex flex-col gap-1">
                {autocompleteOptions.map((item, index) => {
                  return (
                    <Button
                      data-testid={`${DataTestId.TypeaheadInput.BUTTON_POPOVER_OPTION(dataTestId)}-${index}`}
                      className="h-auto justify-start p-1"
                      variant="ghost"
                      key={item}
                      onClick={() => {
                        _onSelectItem(item);
                      }}
                    >
                      {item}
                    </Button>
                  );
                })}
              </div>
            )}
          </PopoverContent>
        </div>
      </div>
    </Popover>
  );
};
