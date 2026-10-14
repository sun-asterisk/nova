import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '@/utils';
import { forwardRef, type ComponentProps, type ComponentRef } from 'react';

// ============================================================================
// Types
// ============================================================================

export type TooltipProviderProps = ComponentProps<typeof TooltipPrimitive.Provider>;
export type TooltipProps = ComponentProps<typeof TooltipPrimitive.Root>;
export type TooltipTriggerProps = ComponentProps<typeof TooltipPrimitive.Trigger>;
export type TooltipContentProps = ComponentProps<typeof TooltipPrimitive.Content> & {
  /** Redirect where the tooltip's portal mounts (default: `document.body`). Forwarded to Radix's `Portal` `container` prop. */
  container?: ComponentProps<typeof TooltipPrimitive.Portal>['container'];
};

// ============================================================================
// TooltipProvider
// ============================================================================

/**
 * TooltipProvider manages the delay duration for all tooltips within its scope.
 * Wrap your app or specific sections with this provider to control tooltip timing.
 *
 * @param delayDuration - Delay in milliseconds before showing the tooltip (default: 500ms)
 * @param skipDelayDuration - Delay before hiding (default: 0ms for immediate hide)
 *
 * @example
 * ```tsx
 * <TooltipProvider delayDuration={300}>
 *   <YourApp />
 * </TooltipProvider>
 * ```
 */
export const TooltipProvider = ({
  delayDuration = 500,
  skipDelayDuration = 0,
  ...props
}: TooltipProviderProps) => {
  return (
    <TooltipPrimitive.Provider
      delayDuration={delayDuration}
      skipDelayDuration={skipDelayDuration}
      {...props}
    />
  );
};

TooltipProvider.displayName = 'TooltipProvider';

// ============================================================================
// Tooltip
// ============================================================================

/**
 * Tooltip root component. Manages the open/close state of the tooltip.
 * Must contain TooltipTrigger and TooltipContent as children.
 *
 * Requires a `<TooltipProvider>` ancestor — mount ONE `<TooltipProvider>` at
 * your app root (not per-Tooltip; Radix's Provider coordinates delay/skip-
 * delay timing *across* tooltips, e.g. moving the pointer from one trigger
 * straight to another skips the delay — that coordination is lost if every
 * Tooltip nests its own Provider, which is what this component did until
 * this was fixed).
 *
 * @example
 * ```tsx
 * // Once, near your app root:
 * <TooltipProvider>
 *   <App />
 * </TooltipProvider>
 *
 * // Anywhere inside it:
 * <Tooltip>
 *   <TooltipTrigger>Hover me</TooltipTrigger>
 *   <TooltipContent>Tooltip text</TooltipContent>
 * </Tooltip>
 * ```
 *
 * @example
 * ```tsx
 * // Controlled mode
 * const [open, setOpen] = useState(false);
 * <Tooltip open={open} onOpenChange={setOpen}>
 *   <TooltipTrigger>Controlled</TooltipTrigger>
 *   <TooltipContent>Content</TooltipContent>
 * </Tooltip>
 * ```
 */
export const Tooltip = ({ ...props }: TooltipProps) => {
  return <TooltipPrimitive.Root {...props} />;
};

Tooltip.displayName = 'Tooltip';

// ============================================================================
// TooltipTrigger
// ============================================================================

/**
 * TooltipTrigger is the element that triggers the tooltip to show.
 * Can be any interactive element (button, link, input, etc.)
 *
 * @param asChild - When true, merges props into the child element (default: true for accessibility)
 *
 * IMPORTANT: because `asChild` defaults to `true` (unlike Radix's own
 * `Trigger`, which defaults to `false`), `children` MUST resolve to exactly
 * one valid React element — Radix's `Slot` throws a runtime error for a
 * plain string/number, multiple children, or a Fragment. This is not
 * caught by TypeScript. If you need to trigger a tooltip from plain text,
 * wrap it in an element first: `<TooltipTrigger><span>text</span></TooltipTrigger>`.
 *
 * @example
 * ```tsx
 * <TooltipTrigger>
 *   <button>Hover me</button>
 * </TooltipTrigger>
 * ```
 *
 * @example
 * ```tsx
 * // For disabled elements, wrap in a span
 * <TooltipTrigger asChild>
 *   <span>
 *     <button disabled>Disabled</button>
 *   </span>
 * </TooltipTrigger>
 * ```
 */
export const TooltipTrigger = forwardRef<
  ComponentRef<typeof TooltipPrimitive.Trigger>,
  TooltipTriggerProps
>(({ asChild = true, ...props }, ref) => {
  return <TooltipPrimitive.Trigger ref={ref} asChild={asChild} {...props} />;
});

TooltipTrigger.displayName = 'TooltipTrigger';

// ============================================================================
// TooltipContent
// ============================================================================

/**
 * TooltipContent displays the actual tooltip content.
 * Automatically positions itself relative to the trigger element.
 *
 * Features:
 * - Shows after 0.5s delay on hover/focus
 * - Hides immediately when trigger loses focus
 * - Supports keyboard navigation (ESC to close)
 * - Maximum width of 240px with automatic text wrapping
 * - Dark background (#333333) with white text
 * - 8px spacing from trigger element
 *
 * @param sideOffset - Distance in pixels from the trigger element (default: 8px)
 * @param side - Position relative to trigger: 'top' | 'right' | 'bottom' | 'left' (default: 'top')
 * @param className - Additional CSS classes to merge with default styles
 *
 * @example
 * ```tsx
 * <TooltipContent>Simple tooltip text</TooltipContent>
 * ```
 *
 * @example
 * ```tsx
 * <TooltipContent side="right">
 *   Right positioned tooltip
 * </TooltipContent>
 * ```
 */
export const TooltipContent = forwardRef<
  ComponentRef<typeof TooltipPrimitive.Content>,
  TooltipContentProps
>(({ className, sideOffset = 8, children, container, ...props }, ref) => {
  return (
    <TooltipPrimitive.Portal container={container}>
      <TooltipPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        className={cn(
          // `z-50` matches every other floating/portal-rendered component in
          // this repo (DropdownMenu, DatePickerPopover, Modal's overlay) —
          // the previous `z-9999` was a real outlier with no Figma or
          // convention basis, always winning stacking order regardless of
          // context (e.g. over an open Modal, which should sit above it).
          // `rounded-sds-100`/`px-sds-100`/`py-sds-50` are token-class equivalents of the
          // same pixel values (radius/100=4px, spacing/100=8px,
          // spacing/50=4px) confirmed directly against the real Tooltip
          // component in Figma (node 9639:4097) — the prior bare
          // `rounded`/`px-2`/`py-1` produced identical values but didn't
          // route through the named token classes design-foundation.md §3
          // requires.
          'z-50 max-w-60 rounded-sds-100 px-sds-100 py-sds-50 typo-body-s',
          // shadow-sds-level-3: confirmed by inspecting the real Tooltip
          // component in Figma directly (not design.md's summary table,
          // which says level-2 but also self-contradicts elsewhere with a
          // "2〜3" range) — its applied effect is literally named
          // "Elevation/Lv.3" (two-layer shadow: offset(0,3) r8 s3 +
          // offset(1,1) r3 s0), matching shadow-sds-level-3 exactly. A prior fix
          // had flipped this to level-2 based on the summary table alone,
          // without re-checking the live component.
          'bg-sds-background-container-inverse text-sds-text-on-surface shadow-sds-level-3',
          // Smooth fade transition with ease
          'transition-all duration-200 ease-out',
          'data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0',
          'data-[state=instant-open]:animate-in data-[state=instant-open]:fade-in-0',
          'data-[state=closed]:animate-out data-[state=closed]:fade-out-0',
          className,
        )}
        {...props}
      >
        {children}
        {/* Figma (Tooltip 9639:4097, Arrow Container 12×4): the arrow sticks
            out 4px from the bubble (was 5px, synced 2026-10-07). */}
        <TooltipPrimitive.Arrow
          className="fill-sds-background-container-inverse"
          width={12}
          height={4}
        />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
});

TooltipContent.displayName = 'TooltipContent';
