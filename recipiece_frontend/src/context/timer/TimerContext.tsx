import { X } from "lucide-react";
import { DateTime } from "luxon";
import { createContext, FC, PropsWithChildren, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useCreateTimerMutation, useDeleteTimerMutation, useListTimersQuery, useUpdateTimerMutation } from "../../api";
import { TokenManager } from "../../api/";
import { ToastAction, useToast } from "../../component";
import { Timer } from "../../data";
import { calculateRemainingTimerMillis, millisToHoursMinuteSeconds } from "../../util";
// @ts-ignore
import AlarmTone from "./AlarmTone.wav";

export const TimerContext = createContext<{
  readonly allTimers: Timer[];
  readonly activeTimers: Timer[];
  readonly createTimer: (timer: Partial<Timer>) => Promise<void>;
  readonly updateTimer: (timer: Partial<Timer>) => Promise<void>;
  readonly deleteTimer: (timerId: number) => Promise<void>;
}>({
  allTimers: [],
  activeTimers: [],
  createTimer: (_) => Promise.resolve(),
  updateTimer: (_) => Promise.resolve(),
  deleteTimer: (_) => Promise.resolve(),
});

const createAudioSource = async () => {
  const context = new AudioContext();
  const source = context.createBufferSource();
  source.connect(context.destination);

  const audioBuffer = await fetch(AlarmTone);
  source.buffer = await context.decodeAudioData(await audioBuffer.arrayBuffer());
  source.loop = true;
  return source;
};

/**
 * A context for managing the timers that a user may have configured.
 *
 * When the app loads in, a request to fetch any active timers is made.
 * This context will handle creating a bunch of in-memory timeouts that,
 * when the time is reached, trigger a toast and a little alert sound.
 *
 * This context should be used to manage CRUD of timers, so that the state is always up to date.
 */
export const TimerContextProvider: FC<PropsWithChildren> = ({ children }) => {
  const tokenManager = TokenManager.getInstance();
  const { toast } = useToast();
  const { data: timersData } = useListTimersQuery(
    {
      page_number: 0,
    },
    {
      disabled: !tokenManager.isLoggedIn,
    }
  );

  const { mutateAsync: _deleteTimer } = useDeleteTimerMutation();
  const { mutateAsync: _createTimer } = useCreateTimerMutation();

  const { mutateAsync: _updateTimer } = useUpdateTimerMutation({
    onSuccess: () => {
      toast({
        title: "Timer Updated",
        description: "Your timer has been updated",
      });
    },
    onFailure: () => {
      toast({
        title: "Could Not Update Timer",
        description: "This timer couldn't be updated. Try again later.",
        variant: "destructive",
      });
    },
  });

  const timerTimeoutIds = useRef<NodeJS.Timeout[]>([]);
  const [allTimers, setAllTimers] = useState<Timer[]>([]);
  const [activeTimers, setActiveTimers] = useState<Timer[]>([]);
  const [hasFetchedInitialTimers, setHasFetchedInitialTimers] = useState(false);

  const sortedActiveTimers = useMemo(() => {
    return activeTimers.sort((a, b) => {
      return calculateRemainingTimerMillis(a) - calculateRemainingTimerMillis(b);
    });
  }, [activeTimers]);

  /**
   * Create a new timer. Use this to ensure that the state of the context
   * always gets the new timer, since react query will only fire on re-render.
   */
  const createTimer = useCallback(
    async (timer: Partial<Timer>) => {
      try {
        const createdTimerResponse = await _createTimer({ ...timer });
        setActiveTimers((prev) => {
          return [...prev, createdTimerResponse.data];
        });
        setAllTimers((prev) => {
          return [...prev, createdTimerResponse.data];
        });
      } catch {
        // noop
      }
    },
    [_createTimer]
  );

  const updateTimer = useCallback(
    async (timer: Partial<Timer>) => {
      try {
        const updatedTimerResponse = await _updateTimer({ ...timer });
        setActiveTimers((prev) => {
          const filteredPrev = prev.filter((t) => {
            return t.id !== updatedTimerResponse.data.id;
          });
          return [...filteredPrev, updatedTimerResponse.data];
        });
        setAllTimers((prev) => {
          const filteredPrev = prev.filter((t) => {
            return t.id !== updatedTimerResponse.data.id;
          });
          return [...filteredPrev, updatedTimerResponse.data];
        });
      } catch {
        // noop
      }
    },
    [_updateTimer]
  );

  const deleteTimer = useCallback(
    async (timerId: number) => {
      // preemptively kill the timer, even if something goes wrong sending the server request
      setActiveTimers((prev) => {
        return prev.filter((t) => t.id !== timerId);
      });
      setAllTimers((prev) => {
        return prev.filter((t) => t.id !== timerId);
      });
      try {
        await _deleteTimer(timerId);
      } catch {
        // noop
      }
    },
    [_deleteTimer]
  );

  /**
   * Set the timers in state on the first successful query response from the list call.
   */
  useEffect(() => {
    if (!hasFetchedInitialTimers && !!timersData) {
      const timers = timersData?.data ?? [];
      setAllTimers(timers);
      setActiveTimers(
        timers.filter((timer) => {
          const absoluteDuration = DateTime.fromISO(timer.created_at).toLocal().toMillis() + timer.duration_ms;
          const remainingMs = absoluteDuration - DateTime.now().toMillis();
          return remainingMs > 0;
        })
      );
      setHasFetchedInitialTimers(true);
    }
  }, [timersData, hasFetchedInitialTimers]);

  const onTimerFinished = useCallback(
    async (timer: Timer) => {
      const onDismissTimer = async () => {
        try {
          await deleteTimer(timer.id);
        } catch {
          // noop
        }
      };

      // remove the timer from the list of active timers. The delete call will actually purge it from both state vars
      setActiveTimers((prev) => {
        return prev.filter((t) => t.id !== timer.id);
      });

      // play the sound
      const audioSource = await createAudioSource();
      audioSource.start();

      // make the toast
      const [hours, minutes, seconds] = millisToHoursMinuteSeconds(timer.duration_ms);
      const timeParts = [];
      if (hours > 0) {
        timeParts.push(`${hours} hour`);
      }

      if (minutes > 0) {
        timeParts.push(`${minutes} minute`);
      }

      if (seconds > 0) {
        timeParts.push(`${seconds} second`);
      }

      toast({
        title: "Time's Up!",
        type: "foreground",
        description: `Your ${timeParts.join(", ")} timer is up!`,
        duration: Infinity,
        onOpenChange: (isOpen) => {
          if (!isOpen) {
            audioSource.stop();
            onDismissTimer();
          }
        },
        action: (
          <ToastAction altText="Dismiss">
            <X size={14} /> Dismiss
          </ToastAction>
        ),
      });
    },
    [toast, deleteTimer]
  );

  /**
   * Create a bunch of timeouts for each timer that we have in memory
   * on reload, clear all of them and redo them
   */
  useEffect(() => {
    timerTimeoutIds.current = activeTimers.map((timer) => {
      const absoluteDuration = DateTime.fromISO(timer.created_at).toLocal().toMillis() + timer.duration_ms;
      const remainingMs = absoluteDuration - DateTime.now().toMillis();
      return setTimeout(() => {
        onTimerFinished(timer);
      }, remainingMs);
    });

    return () => {
      timerTimeoutIds?.current?.forEach((to) => {
        clearTimeout(to);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTimers]);

  /**
   * On logout, kill all the timers
   */
  useEffect(() => {
    if(!tokenManager.isLoggedIn) {
      setActiveTimers([]);
      setAllTimers([]);
    }
  }, [tokenManager.isLoggedIn]);

  return (
    <TimerContext.Provider
      value={{
        allTimers,
        activeTimers: sortedActiveTimers,
        createTimer,
        updateTimer,
        deleteTimer,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
};
