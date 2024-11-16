import { Dispatch, FC, PropsWithChildren, createContext, useEffect, useMemo, useState } from "react";
import { Dialogs } from "../dialog";
import { Dialog } from "../component";

export const DialogContext = createContext<{
  readonly isDialogOpen: boolean;
  readonly setIsDialogOpen: Dispatch<boolean>;
  readonly setCurrentDialogProps: Dispatch<any>;
  readonly setCurrentDialogId: Dispatch<keyof typeof Dialogs | undefined>;
  readonly currentDialogProps: any;
  readonly currentDialogId: keyof typeof Dialogs | undefined;
}>({
  isDialogOpen: false,
  setIsDialogOpen: ((_) => {}) as Dispatch<boolean>,
  setCurrentDialogProps: ((_) => {}) as Dispatch<any>,
  setCurrentDialogId: ((_) => {}) as Dispatch<keyof typeof Dialogs | undefined>,
  currentDialogProps: undefined,
  currentDialogId: undefined,
});

export const DialogContextProvider: FC<PropsWithChildren> = ({ children }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentDialogId, setCurrentDialogId] = useState<keyof typeof Dialogs | undefined>(undefined);
  // @ts-ignore
  const [currentDialogProps, setCurrentDialogProps] = useState<ComponentProps<(typeof Dialogs)[typeof currentDialogId]["component"]>>(undefined);

  useEffect(() => {
    if (!isDialogOpen) {
      setCurrentDialogId(undefined);
      setCurrentDialogProps(undefined);
    }
  }, [isDialogOpen]);

  const DialogComponent = useMemo(() => {
    if(currentDialogId) {
      return Dialogs[currentDialogId].component;
    }
  }, [currentDialogId]);

  return (
    <DialogContext.Provider
      value={{
        isDialogOpen,
        setIsDialogOpen,
        setCurrentDialogProps,
        setCurrentDialogId,
        currentDialogProps,
        currentDialogId,
      }}
    >
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        {children}
        {DialogComponent && <DialogComponent {...(currentDialogProps) || {}} />}
      </Dialog>
    </DialogContext.Provider>
  );
};
