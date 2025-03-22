import { zodResolver } from "@hookform/resolvers/zod";
import {
  ALL_UNITS,
  convertIngredientInDifferentCategory,
  convertIngredientInSameCategory,
} from "@recipiece/conversion";
import { KnownIngredientSchema, RecipeIngredientSchema } from "@recipiece/types";
import { Unit } from "convert-units";
import { search as fuzzySearch } from "fast-fuzzy";
import { ArrowDown, ArrowRight } from "lucide-react";
import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useListKnownIngredientsQuery } from "../../api";
import { Button, Form, FormInput, FormSelect, Label, LoadingGroup, SelectItem, SubmitButton } from "../../component";
import { useResponsiveDialogComponents } from "../../hooks";
import { formatIngredientAmount } from "../../util";
import { BaseDialogProps } from "../BaseDialogProps";

export interface ConvertIngredientDialogSubmit {
  readonly unit: Unit;
  readonly amount: number;
}

export interface ConvertIngredientDialogProps extends BaseDialogProps<ConvertIngredientDialogSubmit> {
  readonly ingredient: RecipeIngredientSchema;
}

const ConvertIngredientFormSchema = z.object({
  targetUnit: z.string(),
  knownIngredientId: z.string().optional(),
  errorContainer: z.any(),
});

export type ConvertIngredientForm = z.infer<typeof ConvertIngredientFormSchema>;

const CONVERT_OPTIONS = ALL_UNITS.map((unitBlob) => {
  return {
    value: unitBlob.convert_symbol,
    display: unitBlob.display_name.plural,
  };
});

export const ConvertIngredientDialog: FC<ConvertIngredientDialogProps> = ({ onClose, onSubmit, ingredient }) => {
  const { ResponsiveContent, ResponsiveHeader, ResponsiveDescription, ResponsiveFooter, ResponsiveTitle } =
    useResponsiveDialogComponents();
  const [matchingKnownIngredient, setMatchingKnownIngredient] = useState<KnownIngredientSchema | undefined>(undefined);
  const [isSussingOutIngredient, setIsSussingOutIngredient] = useState(true);
  const { data: knownIngredients, isLoading: isLoadingKnownIngredients } = useListKnownIngredientsQuery();

  const form = useForm<ConvertIngredientForm>({
    resolver: zodResolver(ConvertIngredientFormSchema),
    defaultValues: {
      targetUnit: "",
      knownIngredientId: undefined,
      errorContainer: undefined,
    },
  });

  const targetUnit = form.watch("targetUnit");

  const availableKnownIngredients = useMemo(() => {
    if (!ingredient.unit) {
      return (knownIngredients?.data ?? []).filter((ki) => {
        return ki.unitless_amount !== null;
      });
    } else {
      return [...(knownIngredients?.data ?? [])];
    }
  }, [knownIngredients, ingredient]);

  const isConvertingInSameCategory = useMemo(() => {
    // if there's no unit, we're doing a unitless conversion, so we must be converting outside our category
    if (!ingredient.unit) {
      return false;
    }
    // if we're just at the default form state, then assume yes
    if (targetUnit === "") {
      return true;
    }
    const matchingUnit = ALL_UNITS.find((item) => item.convert_symbol === targetUnit);
    const originalUnit = ALL_UNITS.find((item) => item.match_on.includes(ingredient.unit!));
    return matchingUnit && originalUnit && matchingUnit?.unit_category === originalUnit?.unit_category;
  }, [targetUnit, ingredient]);

  /**
   * When we have the known ingredients and we're not converting in the same category,
   * try to guess the known ingredient for the user.
   */
  useEffect(() => {
    if (!isConvertingInSameCategory) {
      let matchingKnownIngredient = undefined;
      if (knownIngredients && knownIngredients.data) {
        if (ingredient.amount) {
          const candidates = (knownIngredients?.data ?? []).map((ing) => ing.ingredient_name);
          if (candidates.length) {
            const matches = fuzzySearch(ingredient.name, candidates);
            if (matches.length > 0) {
              const matchingIngName = matches[0];
              matchingKnownIngredient = (knownIngredients?.data ?? []).find((kIng) => {
                return kIng.ingredient_name === matchingIngName;
              });
            }
          }
        }
        setIsSussingOutIngredient(false);
      }
      if (matchingKnownIngredient) {
        setMatchingKnownIngredient(matchingKnownIngredient);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [knownIngredients, isConvertingInSameCategory]);

  useEffect(() => {
    if (matchingKnownIngredient) {
      form.setValue("knownIngredientId", matchingKnownIngredient.id.toString());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchingKnownIngredient]);

  const onConvertIngredient = useCallback(
    (formData: ConvertIngredientForm) => {
      const { targetUnit, knownIngredientId } = formData;
      let newAmount: number | undefined = undefined;
      try {
        if (isConvertingInSameCategory) {
          newAmount = convertIngredientInSameCategory(ingredient, targetUnit as Unit);
        } else {
          const knownIngredient = knownIngredients!.data!.find((ki) => ki.id === +knownIngredientId!)!;
          newAmount = convertIngredientInDifferentCategory(ingredient, knownIngredient, targetUnit as Unit);
        }
      } catch (err) {
        console.error(err);
      }
      if (newAmount !== undefined) {
        const matchingConverter = ALL_UNITS.find((item) => item.convert_symbol === targetUnit)!;
        onSubmit?.({
          amount: newAmount,
          unit: (newAmount === 1
            ? matchingConverter.display_name.singular
            : matchingConverter.display_name.plural) as Unit,
        });
      } else {
        form.setError(
          "errorContainer",
          {
            message: "Cannot make this conversion.",
            type: "custom",
          },
          {
            shouldFocus: false,
          }
        );
      }
    },
    [form, ingredient, isConvertingInSameCategory, knownIngredients, onSubmit]
  );

  return (
    <ResponsiveContent className="p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onConvertIngredient)}>
          <ResponsiveHeader className="mb-4">
            <ResponsiveTitle>Convert {ingredient.name}</ResponsiveTitle>
            <ResponsiveDescription></ResponsiveDescription>
          </ResponsiveHeader>
          <div className="grid grid-cols-1 gap-2">
            <div className="flex flex-col items-center gap-2 sm:flex-row">
              <div className="w-full text-left sm:w-1/3">
                <Label>From:</Label>
                <br />
                {formatIngredientAmount(ingredient.amount ?? "")} {ingredient.unit ?? ""}
              </div>
              <div className="flex w-full flex-row sm:w-1/3">
                <ArrowRight className="ml-auto mr-auto hidden sm:block" />
                <ArrowDown className="ml-auto mr-auto block sm:hidden" />
              </div>
              <div className="w-full sm:w-1/3">
                <FormSelect label="To" name="targetUnit" required>
                  {CONVERT_OPTIONS.map((co) => {
                    return (
                      <SelectItem key={co.value} value={co.value}>
                        {co.display}
                      </SelectItem>
                    );
                  })}
                </FormSelect>
              </div>
            </div>
            {!isConvertingInSameCategory && (
              <>
                <LoadingGroup isLoading={isSussingOutIngredient} className="h-14 w-full">
                  {!isSussingOutIngredient && !isConvertingInSameCategory && (
                    <>
                      {matchingKnownIngredient && (
                        <p className="text-xs">
                          Recipiece thinks your <i>{ingredient.name}</i> matches what it knows as{" "}
                          <i>{matchingKnownIngredient.ingredient_name}</i>, but you can change this if you are using
                          something else.
                        </p>
                      )}
                      {!matchingKnownIngredient && (
                        <p className="text-xs">
                          Recipiece was unable to match your <i>{ingredient.name}</i> to something it knows. You will
                          need to select an ingredient to match with.
                        </p>
                      )}
                    </>
                  )}
                </LoadingGroup>

                <FormSelect
                  name="knownIngredientId"
                  required={!isConvertingInSameCategory}
                  label="Matching Ingredient"
                  disabled={isSussingOutIngredient || isLoadingKnownIngredients}
                >
                  {availableKnownIngredients.map((knownIngredient) => {
                    return (
                      <SelectItem key={knownIngredient.id} value={knownIngredient.id.toString()}>
                        {knownIngredient.ingredient_name}
                      </SelectItem>
                    );
                  })}
                </FormSelect>
              </>
            )}
            <FormInput type="hidden" name="errorContainer" />
          </div>

          <ResponsiveFooter className="mt-4 flex-col-reverse">
            <Button type="button" variant="outline" onClick={() => onClose?.()}>
              Cancel
            </Button>
            <SubmitButton>Convert Ingredient</SubmitButton>
          </ResponsiveFooter>
        </form>
      </Form>
    </ResponsiveContent>
  );
};
