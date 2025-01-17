import Fraction from "fraction.js";
import { MoreVertical, PencilRuler, Scale } from "lucide-react";
import { FC, useCallback, useContext, useMemo } from "react";
import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../component";
import { DialogContext } from "../../context";
import { RecipeIngredient } from "../../data";
import { RelativeScaleIngredientSubmit } from "../../dialog";

export interface IngredientContextMenuProps {
  readonly ingredient: RecipeIngredient;
  readonly onIngredientConverted: (ingredient: RecipeIngredient, newAmount: string, newUnit: string) => void;
  readonly onIngredientRelativeScaled: (scaleFactor: number) => void;
}

export const IngredientContextMenu: FC<IngredientContextMenuProps> = ({ ingredient, onIngredientConverted, onIngredientRelativeScaled }) => {
  const { pushDialog, popDialog } = useContext(DialogContext);

  /**
   * If we cannot treat the value as a fraction, we can't convert or scale it.
   */
  const isNumericIngredientAmount = useMemo(() => {
    if(!ingredient.amount) {
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
      ingredient: ingredient as RecipeIngredient & { amount: string },
      onClose: () => popDialog("relativeScaleIngredient"),
      onSubmit: (data: RelativeScaleIngredientSubmit) => {
        popDialog("relativeScaleIngredient");
        onIngredientRelativeScaled(data.scaleFactor);
      },
    });
  }, [ingredient, onIngredientRelativeScaled, popDialog, pushDialog]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="ml-auto text-primary">
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
