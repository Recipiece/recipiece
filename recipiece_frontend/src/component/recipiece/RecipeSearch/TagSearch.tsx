import { DataTestId } from "@recipiece/constant";
import { ListUserTagsQuerySchema } from "@recipiece/types";
import { XIcon } from "lucide-react";
import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { useListUserTagsQuery } from "../../../api";
import { Badge, FormField, FormItem, FormLabel } from "../../shadcn";
import { TypeaheadInput } from "../TypeaheadInput";
import { RecipeSearchForm } from "./RecipeSearchFormSchema";

export const TagSearch: FC<{ readonly disabled: boolean; readonly dataTestId?: string }> = ({ disabled, dataTestId }) => {
  const baseDataTestId = DataTestId.RecipeSearchBar.INPUT_TAG_SEARCH(dataTestId);
  const [filters, setFilters] = useState<ListUserTagsQuerySchema>({
    page_number: 0,
  });

  const { data: userTags, isLoading: isLoadingUserTags } = useListUserTagsQuery(filters, {
    enabled: !!filters.search && filters.search.length > 1,
  });

  const form = useFormContext<RecipeSearchForm>();
  const currentTagTerm = form.watch("currentTagTerm");

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "tags",
  });

  const onSelectItem = useCallback(
    (value: string) => {
      const sanitized = value.toLowerCase().trim();
      const currentTags = fields.map((t) => t.content);
      if (sanitized.length > 0 && !currentTags.includes(sanitized)) {
        append({
          content: sanitized,
        });
      }

      form.setValue("currentTagTerm", "");
    },
    [append, fields, form]
  );

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Enter") {
        event.preventDefault();
        onSelectItem(currentTagTerm);
      }
    },
    [currentTagTerm, onSelectItem]
  );

  /**
   * debounce the user searching
   */
  useEffect(() => {
    const timeout = setTimeout(() => {
      setFilters((prev) => {
        return { ...prev, search: currentTagTerm };
      });
    }, 250);

    return () => {
      clearTimeout(timeout);
    };
  }, [currentTagTerm]);

  const autocompleteOptions: string[] = useMemo(() => {
    const currentTags = fields.map((t) => t.content);
    return (userTags?.data ?? [])
      .filter((t) => {
        return !currentTags.includes(t.content);
      })
      .map((t) => t.content);
  }, [fields, userTags]);

  return (
    <div className="flex flex-col gap-2">
      <FormField
        control={form.control}
        name="currentTagTerm"
        render={({ field }) => {
          return (
            <FormItem>
              <FormLabel data-testid={DataTestId.Form.LABEL(baseDataTestId)}>Tagged As</FormLabel>
              <TypeaheadInput
                data-testid={baseDataTestId}
                disabled={disabled}
                placeholder="Enter a tag..."
                onKeyDown={onKeyDown}
                autocompleteOptions={autocompleteOptions}
                isLoading={isLoadingUserTags}
                onSelectItem={onSelectItem}
                {...field}
              />
            </FormItem>
          );
        }}
      />
      <div className="flex flex-row flex-wrap gap-2">
        {fields.map((field, index) => {
          return (
            <Badge data-testid={DataTestId.RecipeSearchBar.BADGE_TAG(dataTestId)} key={field.id} className="cursor-pointer dark:text-white" onClick={() => remove(index)}>
              {field.content}
              <XIcon className="ml-2" size={12} />
            </Badge>
          );
        })}
      </div>
    </div>
  );
};
