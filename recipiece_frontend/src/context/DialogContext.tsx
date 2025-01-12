import { ComponentProps, FC, FunctionComponent, PropsWithChildren, createContext, useCallback, useMemo, useState } from "react";
import { Dialog, Drawer } from "../component";
import { Dialogs } from "../dialog";
import { useLayout } from "../hooks";

type DrawerDirection = "bottom" | "left" | "top" | "right" | undefined;

export const DialogContext = createContext<{
  readonly pushDialog: (dialogId: keyof typeof Dialogs, props: ComponentProps<(typeof Dialogs)[typeof dialogId]["component"]> & {readonly direction?: DrawerDirection}) => void;
  readonly popDialog: (dialogId?: keyof typeof Dialogs) => void;
}>({
  popDialog: () => {},
  pushDialog: (_, __) => {},
});

export const DialogContextProvider: FC<PropsWithChildren> = ({ children }) => {
  const { isMobile } = useLayout();
  const [direction, setDirection] = useState<DrawerDirection>("bottom");

  const [dialogStack, setDialogStack] = useState<
    {
      readonly dialogId: keyof typeof Dialogs;
      readonly component: FunctionComponent;
      readonly props: any;
    }[]
  >([]);

  const pushDialog = useCallback((dialogId: keyof typeof Dialogs, props: ComponentProps<(typeof Dialogs)[typeof dialogId]["component"]> & {readonly direction?: DrawerDirection}) => {
    if(props.direction) {
      setDirection(props.direction);
    }
    // @ts-ignore
    setDialogStack((prev) => {
      return [
        {
          dialogId: dialogId,
          component: Dialogs[dialogId].component,
          props: props,
        },
        ...prev,
      ];
    });
  }, []);

  const popDialog = useCallback((dialogId?: keyof typeof Dialogs) => {
    if (dialogId) {
      setDialogStack((prev) => {
        return [...prev.filter((d) => d.dialogId !== dialogId)];
      });
    } else {
      setDialogStack((prev) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [_, ...rest] = prev;
        return [...rest];
      });
    }
    setDirection("bottom");
  }, []);

  const onOpenChange = (value: boolean) => {
    if (!value) {
      popDialog();
    }
  };

  const dialog = useMemo(() => {
    if (dialogStack.length > 0) {
      const { props, component: Component } = dialogStack[dialogStack.length - 1];
      return <Component {...props} />;
    }
  }, [dialogStack]);

  return (
    <DialogContext.Provider
      value={{
        pushDialog,
        popDialog,
      }}
    >
      {!isMobile && (
        <Dialog open={dialogStack.length > 0} onOpenChange={onOpenChange}>
          {children}
          {dialogStack.length > 0 && dialog}
        </Dialog>
      )}
      {isMobile && (
        // On mobile views, we use the drawer for all "dialogs"
        <Drawer direction={direction} open={dialogStack.length > 0} onOpenChange={onOpenChange}>
          {children}
          {dialogStack.length > 0 && dialog}
        </Drawer>
      )}
    </DialogContext.Provider>
  );
};
