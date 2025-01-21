import { createRef, FC, useCallback, useState } from "react";
import { Button, Input, InputProps, PopoverContent, PopoverTrigger } from "../../shadcn";

export interface TypeaheadInputProps extends InputProps {
  readonly autocompleteOptions: (currentValue: string) => string[];
}

export const TypeaheadInput: FC<TypeaheadInputProps> = ({ autocompleteOptions, onChange, ...restInputProps }) => {
  const inputRef = createRef<HTMLInputElement>();
  const [currentAutoCompleteOptions, setCurrentAutoCompleteOptions] = useState<string[]>([]);

  const onSelectAutocompleteItem = useCallback(
    (item: string) => {
      if (inputRef.current) {
        inputRef.current.value = item;
      }
    },
    [inputRef]
  );

  const onChangeWrapper = useCallback(
    (changeEvent: React.ChangeEvent<HTMLInputElement>) => {
      setCurrentAutoCompleteOptions(autocompleteOptions(changeEvent.target.value));
      onChange?.(changeEvent);
    },
    [autocompleteOptions, onChange]
  );

  return (
    <>
      <Input {...restInputProps} ref={inputRef} onChange={onChangeWrapper} />
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
            {currentAutoCompleteOptions.map((item) => {
              return (
                <Button className="justify-start p-1 h-auto" variant="ghost" key={item} onClick={() => onSelectAutocompleteItem(item)}>
                  {item}
                </Button>
              );
            })}
          </div>
        </PopoverContent>
      </div>
    </>
  );
};
