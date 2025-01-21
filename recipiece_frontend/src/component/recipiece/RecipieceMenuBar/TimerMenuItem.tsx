import { FC } from "react";
import { TimerSchema } from "@recipiece/types";

export const TimerMenuItem: FC<{ readonly timer: TimerSchema }> = ({ timer }) => {
  return <></>;
  // const { deleteTimer, updateTimer } = useContext(TimerContext);
  // const { toast } = useToast();
  // const { pushDialog, popDialog } = useContext(DialogContext);

  // const [display, setDisplay] = useState<string>(getTimerDisplay(timer));

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setDisplay(getTimerDisplay(timer));
  //   }, 1000);

  //   return () => {
  //     clearInterval(interval);
  //   };
  // }, [timer]);

  // const onAddTime = useCallback(() => {
  //   pushDialog("addTimeToTimer", {
  //     timer: timer,
  //     onSubmit: async (timerData: AddTimeToTimerForm) => {
  //       const hoursMs = timerData.hours * 60 * 60 * 1000;
  //       const minutesMs = timerData.minutes * 60 * 1000;
  //       const secondsMs = timerData.seconds * 1000;

  //       try {
  //         await updateTimer({
  //           id: timer.id,
  //           duration_ms: timer.duration_ms + hoursMs + minutesMs + secondsMs,
  //         });
  //       } catch {
  //         // noop
  //       }
  //       popDialog("addTimeToTimer");
  //     },
  //     onClose: () => popDialog("addTimeToTimer"),
  //   });
  // }, [popDialog, pushDialog, timer, updateTimer]);

  // const onDeleteTimer = useCallback(async () => {
  //   try {
  //     await deleteTimer(timer.id);
  //     toast({
  //       title: "Timer Cancelled",
  //       description: "Your timer has been cancelled.",
  //     });
  //   } catch {
  //     toast({
  //       title: "Timer Not Cancelled",
  //       description: "There was an error cancelling your timer. Try again later.",
  //     });
  //   }
  // }, [deleteTimer, timer, toast]);

  // return (
  //   <MenubarSub>
  //     <MenubarSubTrigger>{display}</MenubarSubTrigger>
  //     <MenubarSubContent>
  //       <MenubarItem className="items-center" onClick={onAddTime}>
  //         <Plus size={16} className="mr-2" /> Add Time
  //       </MenubarItem>
  //       <MenubarItem className="items-center" onClick={onDeleteTimer}>
  //         <X size={16} className="mr-2" /> Cancel
  //       </MenubarItem>
  //     </MenubarSubContent>
  //   </MenubarSub>
  // );
};
