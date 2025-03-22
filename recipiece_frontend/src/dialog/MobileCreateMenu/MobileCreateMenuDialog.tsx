import { DataTestId } from "@recipiece/constant";
import { Link, Pencil, ShoppingBasket, SquareKanban } from "lucide-react";
import { FC } from "react";
import { Button } from "../../component";
import { useResponsiveDialogComponents } from "../../hooks";
import { BaseDialogProps } from "../BaseDialogProps";

export type MobileCreateMenuDialogOption = "recipe_from_url" | "recipe" | "cookbook" | "shopping_list" | "meal_plan";

export const MobileCreateMenuDialog: FC<BaseDialogProps<MobileCreateMenuDialogOption>> = ({ onSubmit }) => {
  const { ResponsiveContent, ResponsiveHeader, ResponsiveDescription, ResponsiveTitle } =
    useResponsiveDialogComponents();

  return (
    <ResponsiveContent className="p-6">
      <ResponsiveHeader>
        <ResponsiveTitle>Get Cookin&apos;!</ResponsiveTitle>
        <ResponsiveDescription>Create a new...</ResponsiveDescription>
      </ResponsiveHeader>
      <div className="grid grid-cols-1 gap-4 p-2">
        <Button
          data-testid={DataTestId.Dialog.MobileCreateMenuDialog.BUTTON_RECIPE_FROM_URL}
          onClick={() => onSubmit?.("recipe_from_url")}
          className="dark:text-white"
        >
          <Link className="mr-2" />
          Recipe from URL
        </Button>
        <Button
          data-testid={DataTestId.Dialog.MobileCreateMenuDialog.BUTTON_RECIPE_FROM_SCRATCH}
          onClick={() => onSubmit?.("recipe")}
          className="dark:text-white"
        >
          <Pencil className="mr-2" />
          Recipe from Scratch
        </Button>
        <Button
          data-testid={DataTestId.Dialog.MobileCreateMenuDialog.BUTTON_MEAL_PLAN}
          onClick={() => onSubmit?.("meal_plan")}
          className="dark:text-white"
        >
          <SquareKanban className="mr-2" />
          Meal Plan
        </Button>
        <Button
          data-testid={DataTestId.Dialog.MobileCreateMenuDialog.BUTTON_SHOPPING_LIST}
          onClick={() => onSubmit?.("shopping_list")}
          className="dark:text-white"
        >
          <ShoppingBasket className="mr-2" />
          Shopping List
        </Button>
      </div>
    </ResponsiveContent>
  );
};
