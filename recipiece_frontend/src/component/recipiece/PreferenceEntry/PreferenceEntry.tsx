import { FC, PropsWithChildren, ReactNode } from "react";

export const PreferenceEntry: FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <div className="basis-full sm:basis-1/2">{(children as ReactNode[])[0]}</div>
      <div className="basis-full sm:basis-1/2">{(children as ReactNode[])[1]}</div>
    </div>
  );
};
