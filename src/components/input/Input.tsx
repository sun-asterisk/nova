import { cn } from '@/utils';
import { type ComponentProps, forwardRef, type ReactNode } from 'react';
import { inputStyles } from './Input.styles';

/** Available input visual state variants */
export type InputVariant = 'default' | 'error';

/**
 * Input component props extending standard HTML input attributes
 */
export type InputProps = ComponentProps<'input'> & {
  /** Visual state variant of the input field @default 'default' */
  variant?: InputVariant;
  /**
   * Icon or element displayed at the start (left) of the input field.
   * The reserved padding is sized for a 24px icon (this library's default
   * icon size) — a significantly wider adornment (a text label, a small
   * inline control) may overlap the input's typed text, since the padding
   * does not measure the adornment's actual rendered width.
   */
  startAdornment?: ReactNode;
  /** Icon or element displayed at the end (right) of the input field. See `startAdornment` for the sizing contract. */
  endAdornment?: ReactNode;
  /** Additional class names applied to specific internal parts, for customization beyond the root `className`. */
  classNames?: {
    /** The wrapper `<div>` around the input and its adornments — carries the border/background/focus-ring chrome. */
    wrapper?: string;
    /** The start adornment's wrapper `<div>`. */
    startAdornment?: string;
    /** The end adornment's wrapper `<div>`. */
    endAdornment?: string;
  };
};

/**
 * A flexible input field component with support for icons, different states, and customizable styling.
 * Used as the foundation for more complex form components like TextField.
 *
 * @example
 * ```tsx
 * // Basic input
 * <Input placeholder="Enter text" />
 *
 * // Input with icons
 * <Input
 *   placeholder="Search..."
 *   startAdornment={<MdSearch />}
 *   endAdornment={<MdClose />}
 * />
 *
 * // Error state
 * <Input variant="error" placeholder="Fix this field" />
 *
 * // Customizing the wrapper chrome (className alone only reaches the leaf <input>)
 * <Input classNames={{ wrapper: 'h-12 rounded-sds-200' }} />
 * ```
 */

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      variant = 'default',
      className,
      classNames,
      startAdornment,
      endAdornment,
      placeholder = 'テキストを入力',
      disabled,
      ...rest
    },
    ref,
  ) => {
    const effectiveVariant = disabled ? 'disabled' : variant;

    // Figma Text Field icon colors: `icon-secondary`; the start (prefix) icon
    // turns `icon-danger` in the error state; `icon-disable` when disabled.
    // Applied as `color`, so it reaches icons that paint with currentColor.
    const startIconColor = disabled
      ? 'text-sds-icon-disable'
      : variant === 'error'
        ? 'text-sds-icon-danger'
        : 'text-sds-icon-secondary';
    const endIconColor = disabled ? 'text-sds-icon-disable' : 'text-sds-icon-secondary';

    const wrapperClassName = cn(
      'relative flex items-center w-full',
      inputStyles({ variant: effectiveVariant }),
      classNames?.wrapper,
    );

    // `placeholder:` must be on the <input> itself — it was on the wrapper
    // (inputStyles) and never applied, leaving the browser default
    // (Figma sync 2026-10-05).
    const inputClassName = cn(
      'w-full bg-transparent outline-none pl-[12px] pr-[12px] placeholder:text-sds-text-placeholder',
      startAdornment && 'pl-[44px]',
      endAdornment && 'pr-[44px]',
      disabled && 'cursor-not-allowed',
      className,
    );

    return (
      <div className={wrapperClassName}>
        {startAdornment && (
          <div
            className={cn(
              'absolute left-3 flex items-center pointer-events-none',
              startIconColor,
              disabled && 'cursor-not-allowed',
              classNames?.startAdornment,
            )}
          >
            {startAdornment}
          </div>
        )}
        <input
          ref={ref}
          className={inputClassName}
          placeholder={placeholder}
          disabled={disabled}
          {...rest}
        />
        {endAdornment && (
          <div
            className={cn(
              'absolute right-3 flex items-center',
              endIconColor,
              disabled && 'cursor-not-allowed',
              classNames?.endAdornment,
            )}
          >
            {endAdornment}
          </div>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
