import { ComponentProps, useCallback, useContext, useEffect, useMemo } from "react";
import { DialogContext } from "../context";
import { Dialogs } from "../dialog";

const createDialogHook = (dialogId: keyof typeof Dialogs) => {
  return (props: ComponentProps<(typeof Dialogs)[typeof dialogId]["component"]>) => {
    const { setIsDialogOpen, setCurrentDialogId, setCurrentDialogProps } = useContext(DialogContext);

    const modifiedSetIsDialogOpen = useCallback((value: boolean) => {
      if(value) {
        setCurrentDialogId(dialogId);
        setCurrentDialogProps(props);
        setIsDialogOpen(true);
      } else {
        setIsDialogOpen(false);
        setCurrentDialogId(undefined);
        setCurrentDialogProps(undefined);
      }
    }, [props]);

    return {
      setIsDialogOpen: modifiedSetIsDialogOpen,
    };
  };
};

export const useCreateCookbookDialog = createDialogHook("createCookbook");
export const useSearchRecipesDialog = createDialogHook("searchRecipes");
export const useParseRecipeFromURLDialog = createDialogHook("parseRecipeFromURL");
