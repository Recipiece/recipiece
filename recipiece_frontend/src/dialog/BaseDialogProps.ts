export interface BaseDialogProps<SubmitInput = any, SubmitOutput = any> {
  readonly onClose?: () => void;
  readonly onSubmit?: (value: SubmitInput) => Promise<SubmitOutput> | SubmitOutput;
  readonly direction?: "bottom" | "left" | "top" | "right" | undefined;
}
