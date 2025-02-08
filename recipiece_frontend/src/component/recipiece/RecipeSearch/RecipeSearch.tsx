import { ListRecipesQuerySchema } from "@recipiece/types";
import { ScanSearch, Search, XIcon } from "lucide-react";
import { FC, useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { cn } from "../../../util";
import { Badge, Button, Checkbox, Collapsible, CollapsibleContent, CollapsibleTrigger, Input, Label } from "../../shadcn";

export interface RecipeSearchProps {
  readonly onSubmit: (filters: Omit<ListRecipesQuerySchema, "cookbook_id" | "cookbook_attachments" | "page_number" | "page_size">) => Promise<void>;
  readonly className?: string;
  readonly isLoading: boolean;
}

export const RecipeSearch: FC<RecipeSearchProps> = ({ onSubmit, className, isLoading }) => {
  const location = useLocation();

  const [_currIngredientVal, _setCurrIngredientVal] = useState("");
  const [_currTagVal, _setCurrTagVal] = useState("");

  const [ingredients, setIngredients] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [sharedRecipes, setSharedRecipes] = useState<ListRecipesQuerySchema["shared_recipes"]>("include");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);

  const reset = () => {
    setSearchTerm("");
    setIngredients([]);
    setTags([]);
    _setCurrIngredientVal("");
    _setCurrTagVal("");
  };

  const onToggleAdvancedSearch = useCallback(() => {
    if (isAdvancedSearchOpen) {
      reset();
    }
    setIsAdvancedSearchOpen((prev) => {
      return !prev;
    });
  }, [isAdvancedSearchOpen]);

  const onIngredientKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Enter") {
        event.preventDefault();
        setIngredients((prev) => {
          return [...prev, _currIngredientVal];
        });
        _setCurrIngredientVal("");
      }
    },
    [_currIngredientVal]
  );

  const onTagKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Enter") {
        event.preventDefault();
        setTags((prev) => {
          return [...prev, _currTagVal];
        });
        _setCurrTagVal("");
      }
    },
    [_currTagVal]
  );

  const onIngredientRemoved = (idx: number) => {
    setIngredients((prev) => {
      return prev.filter((_, index) => index !== idx);
    });
  };

  const onTagRemoved = (idx: number) => {
    setTags((prev) => {
      return prev.filter((_, index) => index !== idx);
    });
  };

  const onChangeSharedRecipes = () => {
    setSharedRecipes((prev) => {
      if (prev === "include") {
        return "exclude";
      } else {
        return "include";
      }
    });
  };

  const onSearch = useCallback(async () => {
    try {
      setIsSubmitting(true);
      await onSubmit({
        search: searchTerm.length > 2 ? searchTerm : undefined,
        ingredients: ingredients.length > 0 ? [...ingredients] : undefined,
        tags: tags.length > 0 ? [...tags] : undefined,
        shared_recipes: sharedRecipes,
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [ingredients, onSubmit, searchTerm, sharedRecipes, tags]);

  /**
   * When the location changes, close the bar
   */
  useEffect(() => {
    reset();
    setIsAdvancedSearchOpen(false);
  }, [location.pathname]);

  /**
   * When we are not in full advanced mode, debounce on search change
   */
  useEffect(() => {
    if (!isAdvancedSearchOpen) {
      const timeout = setTimeout(() => {
        onSearch();
      }, 300);

      return () => {
        clearTimeout(timeout);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  /**
   * when we collapse the search bar, submit a search
   */
  useEffect(() => { 
    if(!isAdvancedSearchOpen) {
      onSearch();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdvancedSearchOpen]);

  return (
    <Collapsible open={isAdvancedSearchOpen}>
      <div className="mb-2 flex flex-row items-end gap-2">
        <Label className="flex w-full grow flex-col gap-2 sm:w-auto">
          Search
          <Input placeholder="Search by name" disabled={isLoading || isSubmitting} value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} />
        </Label>
        <CollapsibleTrigger asChild>
          <Button title="Advanced Search" variant="outline" onClick={onToggleAdvancedSearch} disabled={isLoading || isSubmitting}>
            <ScanSearch />
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent>
        <div className={cn("flex flex-col gap-2", className)}>
          <Label className="mb-2 mt-2 flex flex-row items-center gap-2">
            <Checkbox disabled={isSubmitting} checked={sharedRecipes === "include"} onCheckedChange={onChangeSharedRecipes} />
            Include Shared Recipes
          </Label>

          <Label>Containing Ingredients</Label>
          <Input
            type="text"
            placeholder="Find recipes containing these ingredients"
            value={_currIngredientVal}
            onChange={(e) => _setCurrIngredientVal(e.target.value)}
            onKeyDown={onIngredientKeyDown}
            disabled={isSubmitting}
          />
          <div className="flex flex-row flex-wrap gap-2">
            {ingredients.map((ing, idx) => {
              return (
                <Badge className="dark:text-white" key={idx} onClick={() => !isSubmitting && onIngredientRemoved(idx)}>
                  {ing} <XIcon className="ml-2" size={12} />
                </Badge>
              );
            })}
          </div>

          <Label>Tagged With</Label>
          <Input
            type="text"
            disabled={isSubmitting}
            placeholder="Find recipes with that have these tags"
            value={_currTagVal}
            onChange={(e) => _setCurrTagVal(e.target.value)}
            onKeyDown={onTagKeyDown}
          />
          <div className="flex flex-row flex-wrap gap-2">
            {tags.map((tag, idx) => {
              return (
                <Badge className="dark:text-white" key={idx} onClick={() => !isSubmitting && onTagRemoved(idx)}>
                  {tag} <XIcon className="ml-2" size={12} />
                </Badge>
              );
            })}
          </div>

          <div className="flex flex-row justify-end">
            <Button onClick={onSearch} disabled={isSubmitting}>
              <Search className="mr-2" /> Search
            </Button>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
