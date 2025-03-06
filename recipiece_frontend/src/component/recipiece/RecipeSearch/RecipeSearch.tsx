import { zodResolver } from "@hookform/resolvers/zod";
import { Constant, DataTestId } from "@recipiece/constant";
import { ListRecipesQuerySchema } from "@recipiece/types";
import { ScanSearch } from "lucide-react";
import { FC, useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation } from "react-router-dom";
import { Button, Collapsible, CollapsibleContent, CollapsibleTrigger, Form } from "../../shadcn";
import { FormInput } from "../Form";
import { IngredientSearch } from "./IngredientSearch";
import { DefaultRecipeSearchFormValues, RecipeSearchForm, RecipeSearchFormSchema } from "./RecipeSearchFormSchema";
import { TagSearch } from "./TagSearch";
import { UserKitchenMembershipSearch } from "./UserKitchenMembershipSearch";

export interface RecipeSearchProps {
  readonly onSubmit: (
    filters: Omit<ListRecipesQuerySchema, "cookbook_id" | "cookbook_attachments" | "page_number" | "page_size">
  ) => Promise<void>;
  readonly isLoading: boolean;
  readonly dataTestId?: string;
}

export const RecipeSearch: FC<RecipeSearchProps> = ({ onSubmit, isLoading, dataTestId }) => {
  const location = useLocation();

  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<RecipeSearchForm>({
    resolver: zodResolver(RecipeSearchFormSchema),
    defaultValues: { ...DefaultRecipeSearchFormValues },
  });

  const search = form.watch("search");
  const userKitchenMembershipIds = form.watch("userKitchenMembershipIds");
  const tags = form.watch("tags");
  const ingredients = form.watch("ingredients");

  const onSearchSubmit = useCallback(
    async (formData: RecipeSearchForm) => {
      setIsSubmitting(true);
      await onSubmit?.({
        search: formData.search,
        ingredients: (formData.ingredients ?? []).map((i) => i.name),
        tags: (formData?.tags ?? []).map((t) => t.content),
        user_kitchen_membership_ids: formData.userKitchenMembershipIds,
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
          form.setValue(
            key as keyof typeof DefaultRecipeSearchFormValues,
            DefaultRecipeSearchFormValues[key as keyof typeof DefaultRecipeSearchFormValues]
          );
        });
    } else {
      form.reset({ ...DefaultRecipeSearchFormValues });
      onSubmit?.({
        search: search,
        ingredients: [],
        tags: [],
        user_kitchen_membership_ids: [Constant.USER_KITCHEN_MEMBERSHIP_IDS_ALL],
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
   * Auto-flush the form when we change something
   * that is explicitly interactable
   */
  useEffect(() => {
    if (isAdvancedSearchOpen && form.formState.isDirty) {
      form.handleSubmit(onSearchSubmit)();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userKitchenMembershipIds, tags, ingredients]);

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
            <FormInput
              data-testid={DataTestId.RecipeSearchBar.INPUT_SEARCH(dataTestId)}
              autoComplete="off"
              disabled={isLoading || isSubmitting}
              placeholder="Search by name..."
              className="flex-grow"
              name="search"
              label="Search"
            />
            <CollapsibleTrigger asChild>
              <Button
                data-testid={DataTestId.RecipeSearchBar.BUTTON_TOGGLE_ADVANCED_SEARCH(dataTestId)}
                variant="outline"
                onClick={onToggleAdvancedSearch}
              >
                <ScanSearch />
              </Button>
            </CollapsibleTrigger>
          </div>

          <CollapsibleContent>
            <div className="mt-2 flex flex-col gap-2">
              <UserKitchenMembershipSearch
                dataTestId={DataTestId.RecipeSearchBar.USER_KITCHEN_MEMBERSHIP_SEARCH(dataTestId)}
                disabled={isLoading || isSubmitting}
              />
              <IngredientSearch
                dataTestId={DataTestId.RecipeSearchBar.INGREDIENT_SEARCH(dataTestId)}
                disabled={isLoading || isSubmitting}
              />
              <TagSearch
                dataTestId={DataTestId.RecipeSearchBar.TAG_SEARCH(dataTestId)}
                disabled={isLoading || isSubmitting}
              />
            </div>
          </CollapsibleContent>
        </Collapsible>
      </form>
    </Form>
  );
};
