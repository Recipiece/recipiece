import { DataTestId } from "@recipiece/constant";
import { ListUserTagsQuerySchema } from "@recipiece/types";
import { XIcon } from "lucide-react";
import { FC, useCallback, useEffect, useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { useListUserTagsQuery } from "../../api";
import { Badge, FormField, FormItem, FormLabel, TypeaheadInput } from "../../component";
import { RecipeEditFormData } from "./RecipeEditFormSchema";

export const TagsForm: FC = () => {
  const [filters, setFilters] = useState<ListUserTagsQuerySchema>({
    page_number: 0,
  });
  const [autocompleteOptions, setAutocompleteOptions] = useState<string[]>([]);

  const { data: userTags, isLoading: isLoadingUserTags } = useListUserTagsQuery(filters, {
    enabled: !!filters.search && filters.search.length > 1,
  });

  const form = useFormContext<RecipeEditFormData>();
  const currentTag = form.watch("currentTag");

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "tags",
  });

  const onSelectItem = useCallback(
    (value: string) => {
      const currentContent = fields.map((t) => t.content);
      const sanitizedValue = value.toLowerCase().trim();

      if (!currentContent.includes(sanitizedValue)) {
        append({ content: sanitizedValue });
      }
      form.setValue("currentTag", "");
      setAutocompleteOptions([]);
      setFilters({ page_number: 0 });
    },
    [append, fields, form]
  );

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Enter") {
        event.preventDefault();
        onSelectItem(currentTag);
      }
    },
    [currentTag, onSelectItem]
  );

  /**
   * Debounce the users typing to set the filters
   */
  useEffect(() => {
    const timeout = setTimeout(() => {
      setFilters((prev) => {
        return { ...prev, search: currentTag };
      });
    }, 300);

    return () => {
      clearTimeout(timeout);
    };
  }, [currentTag]);

  /**
   * set new autocomplete options when the filters change
   */
  useEffect(() => {
    const currentContent = fields.map((t) => t.content);

    const newTags = (userTags?.data ?? []).map((tag) => tag.content).filter((t) => !currentContent.includes(t));
    setAutocompleteOptions(newTags);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userTags]);

  return (
    <div className="flex flex-col gap-2">
      <FormField
        control={form.control}
        name="currentTag"
        render={({ field }) => {
          return (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <TypeaheadInput
                data-testid={DataTestId.RecipeEditPage.TYPEAHEAD_INPUT_TAGS}
                popoverClassName="sm:max-w-[200px]"
                autocompleteOptions={autocompleteOptions}
                onSelectItem={onSelectItem}
                className="flex-grow"
                autoComplete="off"
                placeholder="Enter a tag..."
                isLoading={isLoadingUserTags}
                onKeyDown={onKeyDown}
                {...field}
              />
            </FormItem>
          );
        }}
      />
      <div className="flex flex-row flex-wrap gap-2">
        {fields.map((field, idx) => {
          return (
            <Badge
              data-testid={DataTestId.RecipeEditPage.BADGE_TAG(field.content)}
              className="cursor-pointer dark:text-white"
              key={field.id}
              onClick={() => remove(idx)}
            >
              {field.content} <XIcon size={12} className="ml-2" />
            </Badge>
          );
        })}
      </div>
    </div>
  );
};
