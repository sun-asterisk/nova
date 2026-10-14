import { cn, FOCUS_RING_OFFSET_2 } from '@/utils';
import { ScrollArea as ScrollAreaPrimitive } from 'radix-ui';
import { forwardRef, useState, type ComponentPropsWithoutRef, type ComponentRef } from 'react';
import { scrollbarStyles } from './Scrollbar.styles';

export type ScrollbarProps = ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root> & {
  /** Additional classes for the scroll viewport */
  viewportClassName?: string;
  /** Additional classes for the scrollbars */
  scrollbarClassName?: string;
  /** Additional classes for the scrollbar thumb */
  thumbClassName?: string;
  /** Show vertical scrollbar when content overflows @default true */
  showVertical?: boolean;
  /** Show horizontal scrollbar when content overflows @default true */
  showHorizontal?: boolean;
};

export type ScrollBarAreaProps = ComponentPropsWithoutRef<
  typeof ScrollAreaPrimitive.ScrollAreaScrollbar
> & {
  /** Additional classes for the scrollbar thumb */
  thumbClassName?: string;
};

/**
 * Scrollbar track + thumb primitive.
 * Use this when you need full control over individual scrollbar styling.
 */
export const ScrollBarArea = forwardRef<
  ComponentRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  ScrollBarAreaProps
>(
  (
    {
      className,
      orientation = 'vertical',
      thumbClassName,
      onPointerEnter,
      onPointerLeave,
      ...props
    },
    ref,
  ) => {
    const styles = scrollbarStyles({ orientation });
    // Figma's own guideline text ("Track領域に入った時" — when entering the
    // Track area) specifies that hovering the full track (the 12px "Hit
    // Area", not just the thin 4px thumb) triggers the width-expand
    // animation. A plain CSS `hover:` on the thumb itself both mismatched
    // that spec (only the thumb's own thin visual line would trigger it)
    // and is untestable via `userEvent.hover()` (dispatches synthetic
    // events without moving the real OS cursor, so a plain CSS `:hover`
    // pseudo-class doesn't reliably activate — see Scrollbar.styles.ts).
    // Tracking hover as real React state, driven by the track's own
    // pointer events, fixes both: it matches Figma exactly, and responds
    // correctly to `userEvent.hover()` (which does dispatch real
    // pointerenter/pointerleave events, same mechanism Radix's own
    // track-reveal-on-container-hover already relies on).
    const [isTrackHovered, setIsTrackHovered] = useState(false);

    return (
      <ScrollAreaPrimitive.ScrollAreaScrollbar
        ref={ref}
        data-slot="scroll-area-scrollbar"
        orientation={orientation}
        className={cn(styles.scrollbar(), className)}
        onPointerEnter={(event) => {
          setIsTrackHovered(true);
          onPointerEnter?.(event);
        }}
        onPointerLeave={(event) => {
          setIsTrackHovered(false);
          onPointerLeave?.(event);
        }}
        {...props}
      >
        <ScrollAreaPrimitive.ScrollAreaThumb
          data-slot="scroll-area-thumb"
          data-hovered={isTrackHovered}
          className={cn(styles.thumb(), thumbClassName)}
        />
      </ScrollAreaPrimitive.ScrollAreaScrollbar>
    );
  },
);

ScrollBarArea.displayName = 'ScrollBarArea';

/**
 * Scrollbar component with styled scrollbars.
 * Provides vertical and horizontal scrolling with customizable appearance.
 */
export const Scrollbar = forwardRef<ComponentRef<typeof ScrollAreaPrimitive.Root>, ScrollbarProps>(
  (
    {
      className,
      children,
      viewportClassName,
      scrollbarClassName,
      thumbClassName,
      showVertical = true,
      showHorizontal = true,
      ...props
    },
    ref,
  ) => {
    const styles = scrollbarStyles();

    return (
      <ScrollAreaPrimitive.Root
        ref={ref}
        data-slot="scroll-area"
        className={cn(styles.root(), className)}
        {...props}
      >
        <ScrollAreaPrimitive.Viewport
          data-slot="scroll-area-viewport"
          tabIndex={0}
          className={cn(
            styles.viewport(),
            // Focus ring: `FOCUS_RING_OFFSET_2` from `src/utils/focusRing.ts`
            // — see that file for the full composition rules. This exact
            // element previously had a live "unconditional outline-none"
            // bug (the scroll viewport, tabIndex=0 and genuinely
            // keyboard-focusable, had no visible focus ring at all).
            `size-full rounded-[inherit] transition-[color,box-shadow] ${FOCUS_RING_OFFSET_2}`,
            viewportClassName,
          )}
        >
          {children}
        </ScrollAreaPrimitive.Viewport>
        {showVertical && (
          <ScrollBarArea className={scrollbarClassName} thumbClassName={thumbClassName} />
        )}
        {showHorizontal && (
          <ScrollBarArea
            orientation="horizontal"
            className={scrollbarClassName}
            thumbClassName={thumbClassName}
          />
        )}
        <ScrollAreaPrimitive.Corner />
      </ScrollAreaPrimitive.Root>
    );
  },
);

Scrollbar.displayName = 'Scrollbar';
