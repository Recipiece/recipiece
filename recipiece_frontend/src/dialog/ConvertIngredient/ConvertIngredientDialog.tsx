import { zodResolver } from "@hookform/resolvers/zod";
import { Unit } from "convert-units";
import { search as fuzzySearch } from "fast-fuzzy";
import { ArrowDown, ArrowRight } from "lucide-react";
import { FC, useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useListKnownIngredientsQuery } from "../../api";
import { Button, Form, FormInput, FormSelect, Label, LoadingGroup, SelectItem, SubmitButton } from "../../component";
import { useResponsiveDialogComponents } from "../../hooks";
import { ALL_UNITS, convertIngredient, formatIngredientAmount } from "../../util";
import { BaseDialogProps } from "../BaseDialogProps";
import { KnownIngredientSchema, RecipeIngredientSchema } from "@recipiece/types";

export interface ConvertIngredientDialogSubmit {
  readonly unit: Unit;
  readonly amount: number;
}

export interface ConvertIngredientDialogProps extends BaseDialogProps<ConvertIngredientDialogSubmit> {
  readonly ingredient: RecipeIngredientSchema;
}

const ConvertIngredientFormSchema = z.object({
  targetUnit: z.string(),
  knownIngredientId: z.string(),
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
  const { ResponsiveContent, ResponsiveHeader, ResponsiveDescription, ResponsiveFooter, ResponsiveTitle } = useResponsiveDialogComponents();
  const { data: knownIngredients, isLoading: isLoadingKnownIngredients } = useListKnownIngredientsQuery();
  const [matchingKnownIngredient, setMatchingKnownIngredient] = useState<KnownIngredientSchema | undefined>(undefined);
  const [isSussingOutIngredient, setIsSussingOutIngredient] = useState(true);

  const form = useForm<ConvertIngredientForm>({
    resolver: zodResolver(ConvertIngredientFormSchema),
    defaultValues: {
      targetUnit: "",
      knownIngredientId: undefined,
      errorContainer: undefined,
    },
  });

  /**
   * When the known ingredients load in, try to find the best match
   */
  useEffect(() => {
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

    return () => {
      form.reset({
        targetUnit: "",
        knownIngredientId: undefined,
        errorContainer: undefined,
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [knownIngredients]);

  useEffect(() => {
    if (matchingKnownIngredient) {
      form.setValue("knownIngredientId", matchingKnownIngredient.id.toString());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchingKnownIngredient]);

  const onConvertIngredient = useCallback(
    (formData: ConvertIngredientForm) => {
      const { targetUnit, knownIngredientId } = formData;
      const knownIngredient = knownIngredients!.data!.find((ki) => ki.id === +knownIngredientId)!;
      const newAmount = convertIngredient(ingredient, knownIngredient, targetUnit as Unit);
      if (newAmount) {
        onSubmit?.({
          amount: newAmount,
          unit: targetUnit as Unit,
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
    [form, ingredient, knownIngredients, onSubmit]
  );

  return (
    <ResponsiveContent className="p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onConvertIngredient)}>
          <ResponsiveHeader className="mb-4">
            <ResponsiveTitle>Convert {ingredient.name}</ResponsiveTitle>
            <ResponsiveDescription>
              <LoadingGroup isLoading={isSussingOutIngredient} className="h-16 w-full">
                {!isSussingOutIngredient && (
                  <>
                    <br />
                    {matchingKnownIngredient && (
                      <>
                        Recipiece thinks your <i>{ingredient.name}</i> matches what it knows as <i>{matchingKnownIngredient.ingredient_name}</i>, but you can change this if you are
                        using something else.
                      </>
                    )}
                    {!matchingKnownIngredient && (
                      <>
                        Recipiece was unable to match your <i>{ingredient.name}</i> to something it knows. You will need to select an ingredient to match with.
                      </>
                    )}
                  </>
                )}
              </LoadingGroup>
            </ResponsiveDescription>
          </ResponsiveHeader>
          <div className="grid grid-cols-1 gap-2">
            <FormSelect name="knownIngredientId" required label="Matching Ingredient" disabled={isLoadingKnownIngredients || isSussingOutIngredient}>
              {(knownIngredients?.data ?? []).map((knownIngredient) => {
                return (
                  <SelectItem key={knownIngredient.id} value={knownIngredient.id.toString()}>
                    {knownIngredient.ingredient_name}
                  </SelectItem>
                );
              })}
            </FormSelect>

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
                <FormSelect label="To" name="targetUnit" required disabled={isLoadingKnownIngredients || isSussingOutIngredient}>
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
