import { FC } from "react";
import { Card, CardContent, CardDescription, CardTitle, FormSelect, Label, PreferenceEntry, SelectItem } from "../../component";

export const MeatConfigCard: FC = () => {
  return (
    <Card className="p-6">
      <div className="flex flex-col gap-2">
        <CardTitle>Meats</CardTitle>
        <CardDescription>
          Configure behavior around the meat ingredients in your recipes. Notification timing is based off of the{" "}
          <a
            target="_blank"
            className="underline"
            href="https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/food-safety-basics/big-thaw-safe-defrosting-methods"
          >
            USDA&apos;s recommendations for thawing meat
          </a>.
        </CardDescription>
        <CardContent>
          <div className="flex flex-col gap-4">
            <PreferenceEntry>
              <>
                <Label>Preferred Thawing Method</Label>
                <p className="text-xs">
                  How you prefer to defrost frozen meat. Notifications will only be sent when you are defrosting in the fridge or cold water.
                </p>
              </>

              <FormSelect name="meats.preferred_thawing_method">
                <SelectItem value="refrigerator">Refrigerator</SelectItem>
                <SelectItem value="cold_water">Cold Water</SelectItem>
                <SelectItem value="microwave">Microwave</SelectItem>
              </FormSelect>
            </PreferenceEntry>
          </div>
        </CardContent>
      </div>
    </Card>
  );
};
