import { cn } from '@/utils';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { type ComponentPropsWithoutRef, type ComponentRef, forwardRef, useMemo } from 'react';
import { MdCircle } from 'react-icons/md';
import { radioGroupItemStyles } from './RadioGroup.styles';

/** Available radio group item visual state variants */
export type RadioGroupItemVariant = 'default' | 'error';

/**
 * RadioGroup component props
 */
export type RadioGroupProps = ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>;

/**
 * RadioGroupItem component props
 */
export type RadioGroupItemProps = ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> & {
  /** Visual state variant of the radio item @default 'default' */
  variant?: RadioGroupItemVariant;
};

/**
 * A flexible radio group component for selecting a single option from multiple choices.
 *
 * @example
 * ```tsx
 * // Basic radio group
 * <RadioGroup defaultValue="option1">
 *   <div className="flex items-center gap-2">
 *     <RadioGroupItem value="option1" id="r1" />
 *     <label htmlFor="r1">Option 1</label>
 *   </div>
 *   <div className="flex items-center gap-2">
 *     <RadioGroupItem value="option2" id="r2" />
 *     <label htmlFor="r2">Option 2</label>
 *   </div>
 * </RadioGroup>
 *
 * // With error state
 * <RadioGroupItem value="error" variant="error" />
 * ```
 */

export const RadioGroup = forwardRef<
  ComponentRef<typeof RadioGroupPrimitive.Root>,
  RadioGroupProps
>(({ className, ...props }, ref) => {
  const groupClassName = useMemo(() => cn('grid gap-3', className), [className]);

  return (
    <RadioGroupPrimitive.Root
      ref={ref}
      data-slot="radio-group"
      className={groupClassName}
      {...props}
    />
  );
});

RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

/**
 * RadioGroupItem represents a single selectable option within a RadioGroup.
 * Should be used together with a label for accessibility.
 *
 * @example
 * ```tsx
 * <RadioGroupItem value="option1" id="opt1" />
 * <label htmlFor="opt1">Option 1</label>
 * ```
 */

export const RadioGroupItem = forwardRef<
  ComponentRef<typeof RadioGroupPrimitive.Item>,
  RadioGroupItemProps
>(({ className, variant = 'default', disabled, ...props }, ref) => {
  const effectiveVariant = disabled ? 'disabled' : variant;
  // aria-invalid derives from the existing `variant`/`disabled` state
  // (never a new prop) — an explicit `aria-invalid` in `props` still wins
  // since it spreads after this. `disabled` suppresses it, matching
  // effectiveVariant's own disabled-overrides-error precedent above.

  const itemClassName = useMemo(
    () =>
      cn(
        radioGroupItemStyles({
          variant: effectiveVariant,
        }),
        className,
      ),
    [effectiveVariant, className],
  );

  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      data-slot="radio-group-item"
      className={itemClassName}
      disabled={disabled}
      aria-invalid={effectiveVariant === 'error' || undefined}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="relative flex items-center justify-center"
      >
        <MdCircle className="absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
});

RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;
