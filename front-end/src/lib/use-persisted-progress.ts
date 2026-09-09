import { useEffect, useRef, useState } from "react";
import { desktopBridge } from "./desktop";
import { emptyProgress, type Progress } from "./progress";

/**
 * Progress, backed by the JSON file the shell owns.
 *
 * Writes go out on every toggle rather than on an interval or at quit: a
 * checklist used in an airport gets force-quit, loses battery, and is closed
 * mid-step. A write is a few hundred bytes, so there is nothing to save by
 * batching them.
 *
 * In a browser there is no bridge, so this degrades to plain state and progress
 * lasts as long as the tab.
 */
export function usePersistedProgress(): {
  progress: Progress;
  setProgress: (next: Progress) => void;
  error: string | null;
} {
  const [progress, setLocalProgress] = useState<Progress>(emptyProgress);
  const [error, setError] = useState<string | null>(null);

  /**
   * Saves are held until the first load settles.
   *
   * Without this, a toggle made while the file was still being read would write
   * the empty starting set over real progress — the app would erase itself for
   * anyone who clicked fast on launch.
   */
  const loaded = useRef(false);

  useEffect(() => {
    const bridge = desktopBridge();

    if (bridge === null) {
      loaded.current = true;
      return;
    }

    let cancelled = false;

    bridge.progress
      .load()
      .then((keys) => {
        if (!cancelled) {
          setLocalProgress(new Set(keys));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError("Couldn't read saved progress. Starting from scratch.");
        }
      })
      .finally(() => {
        loaded.current = true;
      });

    return () => {
      cancelled = true;
    };
  }, []);

  function setProgress(next: Progress) {
    setLocalProgress(next);

    const bridge = desktopBridge();

    if (bridge === null || !loaded.current) {
      return;
    }

    // Reported rather than swallowed: silent persistence that isn't persisting
    // is worse than none, because it is trusted.
    bridge.progress
      .save([...next])
      .then(() => setError(null))
      .catch((caught: unknown) => {
        setError(
          caught instanceof Error
            ? `Not saved: ${caught.message}`
            : "Progress could not be saved.",
        );
      });
  }

  return { progress, setProgress, error };
}
