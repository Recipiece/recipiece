import { FC, useCallback } from "react";
import { H3, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../component";
import { StorageKeys } from "../../../util";
import { useLocalStorage } from "../../../hooks";

export const ThemeSection: FC = () => {
  const [selectedTheme, setSelectedTheme, clearSelectedTheme] = useLocalStorage(StorageKeys.UI_THEME, "system");

  const onThemeChanged = useCallback(
    (newTheme: string) => {
      if (newTheme === "system") {
        clearSelectedTheme();
      } else {
        setSelectedTheme(newTheme);
      }

      const systemWantsDark = newTheme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (newTheme === "dark" || systemWantsDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    },
    [clearSelectedTheme, setSelectedTheme]
  );

  return (
    <>
      <H3>Theme</H3>
      <div className="items-top flex flex-row">
        <div className="basis-9/12 sm:basis-1/2">
          <Label>Use Theme</Label>
          <p className="text-xs">Select your preferred theme for this device.</p>
        </div>
        <div className="ml-auto sm:ml-0">
          <Select onValueChange={onThemeChanged} value={selectedTheme}>
            <SelectTrigger className="min-w-40">
              <SelectValue placeholder="Select a Theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="system">System Default</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="light">Light</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </>
  );
};
