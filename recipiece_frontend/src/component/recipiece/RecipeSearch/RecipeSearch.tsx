import { zodResolver } from "@hookform/resolvers/zod";
import { ListRecipesQuerySchema } from "@recipiece/types";
import { ScanSearch, Search } from "lucide-react";
import { FC, useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation } from "react-router-dom";
import { Button, Collapsible, CollapsibleContent, CollapsibleTrigger, Form } from "../../shadcn";
import { FormCheckbox, FormInput, SubmitButton } from "../Form";
import { IngredientSearch } from "./IngredientSearch";
import { DefaultRecipeSearchFormValues, RecipeSearchForm, RecipeSearchFormSchema } from "./RecipeSearchFormSchema";
import { TagSearch } from "./TagSearch";

export interface RecipeSearchProps {
  readonly onSubmit: (filters: Omit<ListRecipesQuerySchema, "cookbook_id" | "cookbook_attachments" | "page_number" | "page_size">) => Promise<void>;
  readonly className?: string;
  readonly isLoading: boolean;
}

export const RecipeSearch: FC<RecipeSearchProps> = ({ onSubmit, className, isLoading }) => {
  const location = useLocation();

  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<RecipeSearchForm>({
    resolver: zodResolver(RecipeSearchFormSchema),
    defaultValues: { ...DefaultRecipeSearchFormValues },
  });

  const search = form.watch("search");

  const onSearchSubmit = useCallback(
    async (formData: RecipeSearchForm) => {
      setIsSubmitting(true);
      await onSubmit?.({
        search: formData.search,
        ingredients: (formData.ingredients ?? []).map((i) => i.name),
        tags: (formData?.tags ?? []).map((t) => t.content),
        shared_recipes: formData.shared_recipes ? "include" : "exclude",
      });
      setIsSubmitting(false);
    },
    [onSubmit]
  );

  const onToggleAdvancedSearch = () => {
    if (!isAdvancedSearchOpen) {
      Object.keys(DefaultRecipeSearchFormValues)
        .filter((key) => key !== "search")
        .forEach((key: string) => {
          form.setValue(key as keyof typeof DefaultRecipeSearchFormValues, DefaultRecipeSearchFormValues[key as keyof typeof DefaultRecipeSearchFormValues]);
        });
    } else {
      form.reset({ ...DefaultRecipeSearchFormValues });
      onSubmit?.({
        search: search,
        ingredients: [],
        tags: [],
        shared_recipes: "include",
      });
    }
    setIsAdvancedSearchOpen((prev) => !prev);
  };

  /**
   * Debounce typing the search term
   */
  useEffect(() => {
    const timeout = setTimeout(() => {
      form.handleSubmit(onSearchSubmit)();
    }, 250);

    return () => {
      clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  /**
   * When the user changes pages, reset the form
   */
  useEffect(() => {
    form.reset({ ...DefaultRecipeSearchFormValues });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSearchSubmit)}>
        <Collapsible open={isAdvancedSearchOpen}>
          <div className="flex flex-row items-end justify-end gap-2">
            <FormInput autoComplete="off" disabled={isLoading || isSubmitting} placeholder="Search by name..." className="flex-grow" name="search" label="Search" />
            <CollapsibleTrigger asChild>
              <Button variant="outline" onClick={onToggleAdvancedSearch}>
                <ScanSearch />
              </Button>
            </CollapsibleTrigger>
          </div>

          <CollapsibleContent>
            <div className="mt-2 flex flex-col gap-2">
              <FormCheckbox disabled={isLoading || isSubmitting} name="shared_recipes" label="Include Recipes Shared to You" />
              <IngredientSearch disabled={isLoading || isSubmitting} />
              <TagSearch disabled={isLoading || isSubmitting} />
            </div>
            <div className="flex flex-row justify-end">
              <SubmitButton>
                <Search className="mr-2" /> Search
              </SubmitButton>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </form>
    </Form>
  );
};
