import Fraction from "fraction.js";
import { MoreVertical, PencilRuler, Scale } from "lucide-react";
import { FC, useCallback, useContext, useMemo, useState } from "react";
import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../component";
import { DialogContext } from "../../context";
import { RelativeScaleIngredientSubmit } from "../../dialog";
import { RecipeIngredientSchema } from "@recipiece/types";

export interface IngredientContextMenuProps {
  readonly ingredient: RecipeIngredientSchema;
  readonly onIngredientConverted: (ingredient: RecipeIngredientSchema, newAmount: string, newUnit: string) => void;
  readonly onIngredientRelativeScaled: (scaleFactor: number) => void;
}

export const IngredientContextMenu: FC<IngredientContextMenuProps> = ({ ingredient, onIngredientConverted, onIngredientRelativeScaled }) => {
  const { pushDialog, popDialog } = useContext(DialogContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  /**
   * If we cannot treat the value as a fraction, we can't convert or scale it.
   */
  const isNumericIngredientAmount = useMemo(() => {
    if (!ingredient.amount) {
      return false;
    }

    try {
      new Fraction(ingredient.amount);
      return true;
    } catch {
      return false;
    }
  }, [ingredient]);

  const onConvertIngredient = useCallback(() => {
    pushDialog("convertIngredient", {
      ingredient: ingredient,
      onClose: () => popDialog("convertIngredient"),
      // @ts-ignore
      onSubmit: (value: ConvertIngredientDialogSubmit) => {
        popDialog("convertIngredient");
        onIngredientConverted(ingredient, value.amount.toString(), value.unit.toString());
      },
    });
  }, [ingredient, onIngredientConverted, popDialog, pushDialog]);

  const onRelativeScaleIngredient = useCallback(() => {
    pushDialog("relativeScaleIngredient", {
      ingredient: ingredient as RecipeIngredientSchema & { amount: string },
      onClose: () => popDialog("relativeScaleIngredient"),
      onSubmit: (data: RelativeScaleIngredientSubmit) => {
        popDialog("relativeScaleIngredient");
        onIngredientRelativeScaled(data.scaleFactor);
      },
    });
  }, [ingredient, onIngredientRelativeScaled, popDialog, pushDialog]);

  return (
    <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="ml-auto text-primary" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <MoreVertical size={12} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={onConvertIngredient} disabled={!ingredient.amount || !isNumericIngredientAmount}>
          <PencilRuler /> Convert
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onRelativeScaleIngredient} disabled={!ingredient.amount || !isNumericIngredientAmount}>
          <Scale /> Relative Scale
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
