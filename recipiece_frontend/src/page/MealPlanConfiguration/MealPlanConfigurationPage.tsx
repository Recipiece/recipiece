import { MealPlanConfigurationSchema } from "@recipiece/types";
import { FC, useCallback, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { useGetMealPlanByIdQuery, useGetSelfQuery, useSetMealPlanConfigurationMutation } from "../../api";
import { Form, H2, LoadingGroup, SubmitButton, useToast } from "../../component";
import { GeneralConfigCard } from "./GeneralConfigCard";
import { MeatConfigCard } from "./MeatConfigCard";
import { NotificationConfigCard } from "./NotificationConfigCard";

export const MealPlanConfigurationPage: FC = () => {
  const { id } = useParams();
  const mealPlanId = +id!;
  const { toast } = useToast();

  const { data: user, isLoading: isLoadingUser } = useGetSelfQuery();
  const { data: mealPlan, isLoading: isLoadingMealPlan } = useGetMealPlanByIdQuery(mealPlanId);
  const { mutateAsync: setMealPlanConfiguration } = useSetMealPlanConfigurationMutation();

  const canEdit = !!user?.id && user.id === mealPlan?.user_id;

  const defaultValues: MealPlanConfigurationSchema = useMemo(() => {
    return {
      generation: {
        excluded_ingredients: [],
      },
      meats: {
        preferred_thawing_method: "refrigerator",
        send_thawing_notification: false,
      },
      general: {
        treat_times_as: "begin_at",
        send_recipe_notification: false,
      },
      ...(mealPlan?.configuration ?? {}),
    };
  }, [mealPlan]);

  const form = useForm<MealPlanConfigurationSchema>({
    defaultValues: { ...defaultValues },
  });

  useEffect(() => {
    form.reset({ ...defaultValues });
  }, [mealPlan]);

  const onSave = useCallback(async (formData: MealPlanConfigurationSchema) => {
    try {
      await setMealPlanConfiguration({
        mealPlanId: mealPlanId,
        configuration: {...formData},
      });
      toast({
        title: "Settings Updated",
        description: "Your meal plan's settings have been updated.",
      });
    } catch {
      toast({
        title: "Error Updating Settings",
        description: "There was an error updating your meal plan's settings. Try again later.",
        variant: "destructive",
      });
    }
  }, []);

  return (
    <LoadingGroup isLoading={isLoadingMealPlan || isLoadingUser} variant="spinner" className="w-12 h-12">
      {mealPlan && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSave)}>
            <div className="flex flex-col gap-2">
              <div className="flex flex-row items-center">
                <H2>{mealPlan.name} Settings</H2>
                {canEdit && (
                  <SubmitButton className="ml-auto">Save</SubmitButton>
                )}
              </div>

              <GeneralConfigCard />
              <NotificationConfigCard />
              <MeatConfigCard />
            </div>
          </form>
        </Form>
      )}
    </LoadingGroup>
  );
};
