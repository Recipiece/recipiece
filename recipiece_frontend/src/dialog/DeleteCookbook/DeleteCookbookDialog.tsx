import { PropsWithChildren } from "react";

export interface DeleteCookbookDialogProps extends PropsWithChildren {
  readonly isOpen: boolean;
  readonly setIsOpen: (value: boolean) => void;
  readonly onSubmit: () => Promise<void>;
}
