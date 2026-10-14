import { cn } from '@/utils';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import {
  forwardRef,
  useEffect,
  useMemo,
  useState,
  type ComponentPropsWithoutRef,
  type ComponentRef,
} from 'react';
import { switchStyles } from './Switch.styles';

/** Available switch sizes */
export type SwitchSize = 'medium' | 'large';

/**
 * Switch component props extending Radix UI Switch Root
 */
export type SwitchProps = ComponentPropsWithoutRef<typeof SwitchPrimitive.Root> & {
  /** Size of the switch @default 'medium' */
  size?: SwitchSize;
  /**
   * Additional class names applied to specific internal parts. `className`
   * itself targets the outer 44x44-minimum tap-area wrapper (accessibility.md
   * §6.1 / Figma's own tap-area guideline), not the visible colored track —
   * use `classNames.track` to customize the track's own appearance.
   */
  classNames?: {
    /** The visible colored track (the switch's own background/shape). */
    track?: string;
    /** The sliding thumb/handle. */
    thumb?: string;
  };
};

/**
 * A toggle switch component for binary on/off states.
 *
 * Renders as two layers: an outer, transparent 44x44-minimum tap-area
 * wrapper (the actual focusable/clickable element — Figma's own guideline
 * requires this regardless of the visible track's smaller size) and an
 * inner visible track holding the sliding thumb. `className` targets the
 * outer wrapper; use `classNames.track`/`classNames.thumb` to customize the
 * visible parts.
 *
 * @example
 * ```tsx
 * // Basic switch
 * <Switch />
 *
 * // Controlled switch
 * const [checked, setChecked] = useState(false);
 * <Switch checked={checked} onCheckedChange={setChecked} />
 *
 * // Large switch
 * <Switch size="large" />
 *
 * // Disabled switch
 * <Switch disabled />
 *
 * // Customizing the visible track
 * <Switch classNames={{ track: 'ring-2 ring-blue-500' }} />
 * ```
 */

export const Switch = forwardRef<ComponentRef<typeof SwitchPrimitive.Root>, SwitchProps>(
  (
    {
      size = 'medium',
      className,
      classNames,
      checked,
      defaultChecked,
      onCheckedChange,
      disabled,
      ...rest
    },
    ref,
  ) => {
    // スタイルは checked 状態に依存するが、非制御 (defaultChecked) では props から
    // 現在値が分からないため内部で追跡する。制御時は checked prop を優先。
    const [uncontrolledChecked, setUncontrolledChecked] = useState(!!defaultChecked);
    const isChecked = checked ?? uncontrolledChecked;

    // Keep the internal fallback in sync while controlled, so it isn't stale
    // if the consumer later stops passing `checked` (a controlled →
    // uncontrolled transition) without the user ever having toggled the
    // switch themselves in the meantime.
    useEffect(() => {
      if (checked !== undefined) {
        setUncontrolledChecked(checked);
      }
    }, [checked]);

    const styles = useMemo(
      () => switchStyles({ size, checked: isChecked, disabled }),
      [size, isChecked, disabled],
    );

    return (
      <SwitchPrimitive.Root
        ref={ref}
        className={cn(styles.root(), className)}
        checked={checked}
        defaultChecked={defaultChecked}
        onCheckedChange={(value) => {
          setUncontrolledChecked(value);
          onCheckedChange?.(value);
        }}
        disabled={disabled}
        {...rest}
      >
        <span className={cn(styles.track(), classNames?.track)}>
          <SwitchPrimitive.Thumb className={cn(styles.thumb(), classNames?.thumb)} />
        </span>
      </SwitchPrimitive.Root>
    );
  },
);

Switch.displayName = 'Switch';
