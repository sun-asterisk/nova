import { cn } from '@/utils';
import { type ComponentProps, forwardRef } from 'react';
import { scrimStyles } from './Scrim.styles';

/** Scrim props — a plain `<div>`; `children` is omitted (the scrim is a backdrop, not a container). */
export type ScrimProps = Omit<ComponentProps<'div'>, 'children'>;

/**
 * Full-viewport backdrop behind a front component (Figma "Scrim"). It shows
 * that the page behind is temporarily unavailable — not a decorative
 * background. Do not use it for transient, non-blocking notices (Snackbar).
 *
 * `Modal` renders it for you (`ModalOverlay` uses the same styles). Use
 * `Scrim` directly only when building your own overlay (e.g. a custom
 * drawer): render it while the front component is open and, if a click on
 * the backdrop should close that component, pass `onClick` — the whole scrim
 * is the click target (Figma guideline). Presentational: no portal, no focus
 * management, no scroll lock — the front component owns those.
 *
 * Decorative to assistive technology (`aria-hidden`); keyboard users close
 * the front component with its own controls / Escape.
 *
 * @example
 * ```tsx
 * {open && (
 *   <>
 *     <Scrim onClick={() => setOpen(false)} />
 *     <MyDrawer onClose={() => setOpen(false)} />
 *   </>
 * )}
 * ```
 */
export const Scrim = forwardRef<HTMLDivElement, ScrimProps>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="scrim"
    aria-hidden="true"
    className={cn(scrimStyles(), className)}
    {...props}
  />
));

Scrim.displayName = 'Scrim';
