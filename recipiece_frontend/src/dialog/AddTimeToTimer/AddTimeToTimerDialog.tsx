import { zodResolver } from "@hookform/resolvers/zod";
import { FC, useCallback, useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button, Form, FormInput, SubmitButton } from "../../component";
import { Timer } from "../../data";
import { useResponsiveDialogComponents } from "../../hooks";
import { BaseDialogProps } from "../BaseDialogProps";
import { calculateRemainingTimerMillis, getTimerDisplay, Timers } from "../../util";
import { DialogContext } from "../../context";

export interface AddTimeToTimerDialogProps extends BaseDialogProps<AddTimeToTimerForm> {
  readonly timer: Timer;
}

const AddTimeToTimerFormSchema = z.object({
  hours: z.coerce.number().max(23).min(0),
  minutes: z.coerce.number().max(59).min(0),
  seconds: z.coerce.number().max(59).min(0),
  hidden: z.string().nullable().optional(),
});

export type AddTimeToTimerForm = z.infer<typeof AddTimeToTimerFormSchema>;

export const AddTimeToTimerDialog: FC<AddTimeToTimerDialogProps> = ({ timer, onSubmit, onClose }) => {
  const { popDialog } = useContext(DialogContext);
  const { ResponsiveContent, ResponsiveHeader, ResponsiveDescription, ResponsiveTitle, ResponsiveFooter } = useResponsiveDialogComponents();
  const [display, setDisplay] = useState<string>(getTimerDisplay(timer));

  useEffect(() => {
    const interval = setInterval(() => {
      if (calculateRemainingTimerMillis(timer) <= 0) {
        popDialog("addTimeToTimer");
      } else {
        setDisplay(getTimerDisplay(timer));
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timer]);

  const form = useForm<AddTimeToTimerForm>({
    resolver: zodResolver(AddTimeToTimerFormSchema),
    defaultValues: {
      hours: 0,
      minutes: 0,
      seconds: 0,
    },
  });

  const { isSubmitting } = form.formState;

  const onAddTime = useCallback(
    async (formData: AddTimeToTimerForm) => {
      const remainingTimeMs = calculateRemainingTimerMillis(timer);
      const hoursMs = formData.hours * 60 * 60 * 1000;
      const minutesMs = formData.minutes * 60 * 1000;
      const secondsMs = formData.seconds * 1000;

      const newTotalTime = remainingTimeMs + hoursMs + minutesMs + secondsMs;

      if (newTotalTime > Timers.MAX_TIME_MS) {
        form.setError(
          "hidden",
          {
            type: "custom",
            message: "The total time cannot be more than 24 hours",
          },
          {
            shouldFocus: false,
          }
        );
      } else {
        onSubmit?.(formData);
      }
    },
    [onSubmit, timer, form]
  );

  return (
    <ResponsiveContent className="p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onAddTime)}>
          <ResponsiveHeader className="mb-4">
            <ResponsiveTitle>Add Time</ResponsiveTitle>
            <ResponsiveDescription>Add time to your {display} timer.</ResponsiveDescription>
          </ResponsiveHeader>

          <div className="flex flex-row gap-2">
            <FormInput name="hours" type="number" label="Hours" />
            <FormInput name="minutes" type="number" label="Minutes" />
            <FormInput name="seconds" type="number" label="Seconds" />
          </div>
          <FormInput name="hidden" type="hidden" required={false} readOnly />

          <ResponsiveFooter className="mt-4 flex-col-reverse">
            <Button disabled={isSubmitting} type="button" variant="outline" onClick={() => onClose?.()}>
              Cancel
            </Button>
            <SubmitButton>Add Time</SubmitButton>
          </ResponsiveFooter>
        </form>
      </Form>
    </ResponsiveContent>
  );
};
