import { cn } from '@/utils';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { type ComponentProps, forwardRef, type ComponentRef, useMemo } from 'react';
import { IconCheck, IconMinus } from '../icons';
import { checkboxStyles } from './Checkbox.styles';

/** Available checkbox visual state variants */
export type CheckboxVariant = 'default' | 'error';

/**
 * Checkbox component props extending Radix UI Checkbox.Root.
 *
 * `children` is intentionally omitted — Checkbox.Root always renders its own
 * check/indeterminate indicator as its only child; a label must be rendered
 * as a sibling, associated via `id`/`htmlFor` (see the usage example below).
 */
export type CheckboxProps = Omit<
  ComponentProps<typeof CheckboxPrimitive.Root>,
  'children' | 'asChild'
> & {
  /** Visual state variant of the checkbox @default 'default' */
  variant?: CheckboxVariant;
};

/**
 * A checkbox with checked, unchecked and indeterminate states and default/error variants.
 *
 * @example
 * ```tsx
 * // Basic checkbox
 * <Checkbox />
 *
 * // Checkbox with label (label is a sibling, associated via id/htmlFor —
 * // Checkbox.Root always renders its own indicator as its only child)
 * <Checkbox id="terms" />
 * <label htmlFor="terms">Accept terms</label>
 *
 * // Error state
 * <Checkbox variant="error" />
 *
 * // Indeterminate state
 * <Checkbox checked="indeterminate" />
 * ```
 */

export const Checkbox = forwardRef<ComponentRef<typeof CheckboxPrimitive.Root>, CheckboxProps>(
  ({ variant = 'default', className, disabled, ...props }, ref) => {
    const effectiveVariant = disabled ? 'disabled' : variant;
    // aria-invalid derives from the existing `variant`/`disabled` state
    // (never a new prop) — an explicit `aria-invalid` in `props` still
    // wins since it spreads after this. `disabled` suppresses it, matching
    // effectiveVariant's own disabled-overrides-error precedent above.
    const checkboxClassName = useMemo(
      () =>
        cn(
          checkboxStyles({
            variant: effectiveVariant,
          }),
          className,
        ),
      [effectiveVariant, className],
    );

    return (
      <CheckboxPrimitive.Root
        ref={ref}
        data-slot="checkbox"
        className={checkboxClassName}
        disabled={disabled}
        aria-invalid={effectiveVariant === 'error' || undefined}
        {...props}
      >
        <CheckboxPrimitive.Indicator
          data-slot="checkbox-indicator"
          className="grid place-content-center text-current transition-none"
        >
          {/* Both icons are always rendered; CSS on the Indicator's own
              Radix-resolved `data-state` picks the visible one. Reading
              `props.checked` instead missed uncontrolled usage
              (`defaultChecked="indeterminate"` showed a check mark). The
              direct-child selector (`[...]>&`) deliberately matches only the
              Indicator itself — an `in-data-*` ancestor match would also
              react to any unrelated outer element carrying `data-state`. */}
          <IconCheck className="[[data-state=indeterminate]>&]:hidden" />
          <IconMinus className="[[data-state=checked]>&]:hidden" />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
    );
  },
);

Checkbox.displayName = 'Checkbox';
