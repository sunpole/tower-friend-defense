import { useRef, useEffect } from 'react';

/**
 * Stable game loop using requestAnimationFrame.
 * The callback is stored in a ref so that updating it does NOT cancel and
 * restart the RAF — which is the main cause of frame stutter / movement hitches
 * when the parent component re-renders ~60 times per second.
 */
export function useGameLoop(
  callback: (deltaTime: number) => void,
  isRunning: boolean
) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (!isRunning) return;

    let rafId = 0;
    let prevTime: number | undefined;

    const tick = (time: number) => {
      if (prevTime !== undefined) {
        const dt = Math.min((time - prevTime) / 1000, 0.1);
        callbackRef.current(dt);
      }
      prevTime = time;
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isRunning]);
}
