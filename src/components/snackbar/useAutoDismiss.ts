import { type RefObject, useEffect, useRef } from 'react';

/**
 * INTERNAL (not exported from the package). Auto-dismiss timer for
 * `Snackbar`: calls `onComplete` once `duration` ms have elapsed while the
 * snackbar is NOT being read — the countdown pauses while the pointer is over
 * it, while focus is inside it, and while the tab is hidden, and resumes with
 * only the remaining time (Figma Snackbar guideline: "マウスカーソルが
 * Snackbarの上に乗っている間は、タイムアウトによる非表示を一時停止します").
 *
 * Replaces the countdown progress bar (removed 2026-10-07): Figma has no
 * countdown bar — its Progress Bar is a task-progress indicator used only by
 * the `loading` status — so the timer now runs without a visible bar.
 *
 * Inside sonner's toaster the pause scope is the whole toaster, matching
 * sonner's own behavior of pausing every toast while one is hovered.
 *
 * `duration <= 0` (or `enabled === false`) disables auto-dismiss.
 */
export function useAutoDismiss({
  duration,
  enabled,
  onComplete,
  scopeRef,
}: {
  duration: number;
  enabled: boolean;
  onComplete: () => void;
  scopeRef: RefObject<HTMLElement | null>;
}) {
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const root = scopeRef.current;
    if (!enabled || duration <= 0 || !root) return;
    const scope = root.closest<HTMLElement>('[data-sonner-toaster]') ?? root;

    let remaining = duration;
    let startedAt: number | null = null;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let completed = false;
    let hovered = safeMatches(scope, ':hover');
    let focused = safeMatches(scope, ':focus-within');

    const complete = () => {
      if (completed) return;
      completed = true;
      onCompleteRef.current();
    };
    const start = () => {
      if (timer !== undefined || completed) return;
      if (remaining <= 0) return complete();
      startedAt = Date.now();
      timer = setTimeout(complete, remaining);
    };
    const pause = () => {
      if (timer === undefined) return;
      clearTimeout(timer);
      timer = undefined;
      if (startedAt !== null) {
        remaining = Math.max(0, remaining - (Date.now() - startedAt));
        startedAt = null;
      }
    };
    const sync = () => {
      if (hovered || focused || document.hidden) pause();
      else start();
    };
    const onPointerEnter = () => {
      hovered = true;
      sync();
    };
    const onPointerLeave = () => {
      hovered = false;
      sync();
    };
    const onFocusIn = () => {
      focused = true;
      sync();
    };
    const onFocusOut = (e: FocusEvent) => {
      focused = scope.contains(e.relatedTarget as Node | null);
      sync();
    };

    scope.addEventListener('pointerenter', onPointerEnter);
    scope.addEventListener('pointerleave', onPointerLeave);
    scope.addEventListener('focusin', onFocusIn);
    scope.addEventListener('focusout', onFocusOut);
    document.addEventListener('visibilitychange', sync);
    sync();

    return () => {
      if (timer !== undefined) clearTimeout(timer);
      scope.removeEventListener('pointerenter', onPointerEnter);
      scope.removeEventListener('pointerleave', onPointerLeave);
      scope.removeEventListener('focusin', onFocusIn);
      scope.removeEventListener('focusout', onFocusOut);
      document.removeEventListener('visibilitychange', sync);
    };
  }, [duration, enabled, scopeRef]);
}

function safeMatches(el: Element, selector: string): boolean {
  try {
    return el.matches(selector);
  } catch {
    return false;
  }
}
