import { FC } from "react";
import { Card, CardContent, CardDescription, CardTitle, FormSelect, Label, PreferenceEntry, SelectItem } from "../../component";

export const GeneralConfigCard: FC = () => {
  return (
    <Card className="p-6">
      <div className="flex flex-col gap-2">
        <CardTitle>General</CardTitle>
        <CardDescription>Configure general settings for your meal plan.</CardDescription>
        <CardContent>
          <div className="flex flex-col gap-2">
            <PreferenceEntry>
              <>
                <Label>Treat times as</Label>
                <p className="text-xs">How to handle meal plan item times. This affects when notifications are sent.</p>
              </>

              <FormSelect name="general.treat_times_as">
                <SelectItem value="begin_at">When to start the meal</SelectItem>
                <SelectItem value="finish_at">When to finish the meal</SelectItem>
              </FormSelect>
            </PreferenceEntry>
          </div>
        </CardContent>
      </div>
    </Card>
  );
};
