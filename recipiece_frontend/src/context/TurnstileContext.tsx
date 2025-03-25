import { Turnstile, TurnstileInstance } from "@marsidev/react-turnstile";
import { createContext, FC, PropsWithChildren, useCallback, useRef, useState } from "react";
import { useLocalStorage } from "../hooks";
import { StorageKeys } from "../util";

export const TurnstileContext = createContext<{
  readonly getTurnstileToken: (timeout?: number) => Promise<string | undefined>;
  readonly isTurnstileEnabled: boolean;
  readonly turnstileError: string | undefined;
}>({
  isTurnstileEnabled: false,
  getTurnstileToken: () => Promise.resolve(undefined),
  turnstileError: undefined,
});

export const TurnstileContextProvider: FC<PropsWithChildren> = ({ children }) => {
  const [selectedTheme] = useLocalStorage(StorageKeys.UI_THEME, "system");
  const [turnstileError, setTurnstileError] = useState<string | undefined>(undefined);

  const turnstileSiteKey = process.env.RECIPIECE_TURNSTILE_SITE_KEY;
  const isEnabled = !!turnstileSiteKey;

  const turnstileRef = useRef<TurnstileInstance | undefined>(undefined);

  const getToken = useCallback(
    async (timeout: number = 5000): Promise<string | undefined> => {
      return turnstileRef?.current?.getResponsePromise(timeout);
    },
    [turnstileRef]
  );

  return (
    <TurnstileContext.Provider
      value={{
        getTurnstileToken: getToken,
        isTurnstileEnabled: isEnabled,
        turnstileError: turnstileError,
      }}
    >
      {children}
      <div className="absolute bottom-2 right-2">
        {isEnabled && (
          <Turnstile
            ref={turnstileRef}
            options={{
              theme: !selectedTheme || selectedTheme === "system" ? "auto" : (selectedTheme as "light" | "dark"),
              retry: "auto",
            }}
            onError={setTurnstileError}
            siteKey={turnstileSiteKey}
          />
        )}
      </div>
    </TurnstileContext.Provider>
  );
};
