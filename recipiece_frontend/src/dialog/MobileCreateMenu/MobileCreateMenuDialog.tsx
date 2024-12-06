import { BookPlus, Link, Pencil, ShoppingBasket, Watch } from "lucide-react";
import { FC } from "react";
import { Button } from "../../component";
import { useResponsiveDialogComponents } from "../../hooks";
import { BaseDialogProps } from "../BaseDialogProps";

export type MobileCreateMenuDialogOption = "recipe_from_url" | "recipe" | "cookbook" | "shopping_list" | "timer";

export const MobileCreateMenuDialog: FC<BaseDialogProps<MobileCreateMenuDialogOption>> = ({ onSubmit }) => {
  const { ResponsiveContent, ResponsiveHeader, ResponsiveDescription, ResponsiveTitle } = useResponsiveDialogComponents();

  return (
    <ResponsiveContent className="p-6">
      <ResponsiveHeader>
        <ResponsiveTitle>Get Cookin'!</ResponsiveTitle>
        <ResponsiveDescription>Create a new...</ResponsiveDescription>
      </ResponsiveHeader>
      <div className="grid grid-cols-1 gap-4 p-2">
        <Button onClick={() => onSubmit?.("recipe_from_url")}>
          <Link className="mr-2" />
          Recipe from URL
        </Button>
        <Button onClick={() => onSubmit?.("recipe")}>
          <Pencil className="mr-2" />
          Recipe from Scratch
        </Button>
        <Button onClick={() => onSubmit?.("cookbook")}>
          <BookPlus className="mr-2" />
          Cookbook
        </Button>
        <Button onClick={() => onSubmit?.("timer")}>
          <Watch className="mr-2"/>
          Timer
        </Button>
        <Button onClick={() => onSubmit?.("shopping_list")}>
          <ShoppingBasket className="mr-2" />
          Shopping List
        </Button>
      </div>
    </ResponsiveContent>
  );
};
