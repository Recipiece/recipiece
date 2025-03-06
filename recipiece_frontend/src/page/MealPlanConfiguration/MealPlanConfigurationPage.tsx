import { MealPlanConfigurationSchema } from "@recipiece/types";
import { ArrowLeft } from "lucide-react";
import { FC, useCallback, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { useGetMealPlanByIdQuery, useGetSelfQuery, useSetMealPlanConfigurationMutation } from "../../api";
import { Button, Form, H2, LoadingGroup, SubmitButton, useToast } from "../../component";
import { GeneralConfigCard } from "./GeneralConfigCard";
import { MeatConfigCard } from "./MeatConfigCard";
import { NotificationConfigCard } from "./NotificationConfigCard";

export const MealPlanConfigurationPage: FC = () => {
  const navigate = useNavigate();
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValues]);

  const onSave = useCallback(
    async (formData: MealPlanConfigurationSchema) => {
      try {
        await setMealPlanConfiguration({
          mealPlanId: mealPlanId,
          configuration: { ...formData },
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
    },
    [mealPlanId, setMealPlanConfiguration, toast]
  );

  return (
    <LoadingGroup isLoading={isLoadingMealPlan || isLoadingUser} variant="spinner" className="h-12 w-12">
      {mealPlan && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSave)}>
            <div className="flex flex-col gap-2">
              <div className="flex flex-row items-center gap-2">
                <Button variant="outline" onClick={() => navigate(`/meal-plan/view/${mealPlanId}`)}>
                  <ArrowLeft />
                </Button>
                <H2 className="mb-0 pb-0">{mealPlan.name}</H2>
                {canEdit && <SubmitButton className="ml-auto">Save</SubmitButton>}
              </div>

              {/* <GeneralConfigCard /> */}
              <NotificationConfigCard />
              <MeatConfigCard />
            </div>
          </form>
        </Form>
      )}
    </LoadingGroup>
  );
};
