import { cn } from '@/utils';
import { type ComponentProps, forwardRef } from 'react';
import { dividerStyles } from './Divider.styles';

/** Available divider orientations */
export type DividerOrientation = 'horizontal' | 'vertical';

/**
 * Divider component props extending standard HTML div attributes.
 * Renders as a self-closing element — `children` is intentionally omitted
 * since it is never rendered (this is a pure visual separator).
 */
export type DividerProps = Omit<ComponentProps<'div'>, 'children'> & {
  /** Orientation of the divider @default 'horizontal' */
  orientation?: DividerOrientation;
  /** If true, the divider will stretch to fill its container when vertical (useful in flex layouts) @default false */
  flexItem?: boolean;
};

/**
 * A divider component for visually separating content.
 * Supports both horizontal and vertical orientations with flex layout support.
 *
 * Renders with no built-in margin — Figma's own usage varies the gap around
 * a divider by context (8px between dense list items, 16px inside a card,
 * 32px between page-level sections), so spacing is left entirely to the
 * consumer's own layout (a wrapping element's margin, or a flex/grid `gap`).
 *
 * @example
 * ```tsx
 * // Horizontal divider (default) — consumer controls the surrounding gap
 * <div className="flex flex-col gap-4">
 *   <p>Above</p>
 *   <Divider />
 *   <p>Below</p>
 * </div>
 *
 * // Vertical divider in flex layout
 * <div style={{ display: 'flex', height: '100px' }} className="gap-2">
 *   <span>Left</span>
 *   <Divider orientation="vertical" flexItem />
 *   <span>Right</span>
 * </div>
 * ```
 */

export const Divider = forwardRef<HTMLDivElement, DividerProps>(
  ({ orientation = 'horizontal', flexItem = false, className, ...rest }, ref) => {
    const dividerClassName = cn(
      dividerStyles({
        orientation,
        flexItem: orientation === 'vertical' && flexItem ? true : undefined,
      }),
      className,
    );

    return (
      <div
        ref={ref}
        className={dividerClassName}
        role="separator"
        aria-orientation={orientation === 'vertical' ? 'vertical' : undefined}
        {...rest}
      />
    );
  },
);

Divider.displayName = 'Divider';
