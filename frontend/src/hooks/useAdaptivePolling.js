import { useEffect, useRef } from "react";

/**
 * Runs one poll at a time, refreshes immediately when the user returns, and
 * backs off while the page is hidden. The callback is kept in a ref so state
 * changes do not tear down and recreate the timer.
 */
export default function useAdaptivePolling(
  callback,
  { intervalMs, hiddenIntervalMs = intervalMs * 5, enabled = true },
) {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled) return undefined;

    let stopped = false;
    let running = false;
    let timerId;

    const schedule = () => {
      if (stopped) return;
      const delay = document.hidden ? hiddenIntervalMs : intervalMs;
      timerId = window.setTimeout(run, delay);
    };

    const run = async () => {
      if (stopped || running) return;
      running = true;
      try {
        await callbackRef.current();
      } catch {
        // Background refresh failures are retried on the next scheduled poll.
      } finally {
        running = false;
        schedule();
      }
    };

    const refreshNow = () => {
      if (document.hidden) return;
      window.clearTimeout(timerId);
      void run();
    };

    void run();
    document.addEventListener("visibilitychange", refreshNow);
    window.addEventListener("focus", refreshNow);
    window.addEventListener("online", refreshNow);

    return () => {
      stopped = true;
      window.clearTimeout(timerId);
      document.removeEventListener("visibilitychange", refreshNow);
      window.removeEventListener("focus", refreshNow);
      window.removeEventListener("online", refreshNow);
    };
  }, [enabled, hiddenIntervalMs, intervalMs]);
}
