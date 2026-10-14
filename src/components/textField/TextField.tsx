import { type ComponentProps, forwardRef, type ReactNode } from 'react';
import { Input, type InputVariant } from '../input';
import { IconExclamationCircle } from '../icons';
import { cn, useFieldIds } from '@/utils';

/** TextField variant inherits from Input variant */
export type TextFieldVariant = InputVariant;

/**
 * TextField component props extending standard HTML input attributes
 */
export type TextFieldProps = Omit<ComponentProps<'input'>, 'size'> & {
  /** Visual style variant of the text field @default 'default' */
  variant?: TextFieldVariant;
  /** Label text displayed above the input field @default 'ラベル' */
  label?: string;
  /** Error message to display below the input. When provided, the input will show error state */
  error?: string;
  /** Helper text displayed below the input to provide additional context or instructions */
  supportText?: string;
  /** Whether the field is required. Shows a required indicator next to the label @default false */
  required?: boolean;
  /** Icon or element displayed at the start (left) of the input field */
  startAdornment?: ReactNode;
  /** Icon or element displayed at the end (right) of the input field */
  endAdornment?: ReactNode;
  /** Custom text for the required indicator badge @default '必須' */
  requiredText?: string;
  /** Additional class names applied to specific internal parts, for customization beyond the root `className` (which reaches only the leaf input). */
  classNames?: {
    /** The `<label>` element. */
    label?: string;
    /** The support-text `<span>`. */
    supportText?: string;
    /** The error-message container. */
    error?: string;
  };
};

/**
 * A text field component that combines an input field with label, validation, and helper text functionality.
 * Built on top of the Input component with additional form-related features.
 *
 * @example
 * ```tsx
 * // Basic text field
 * <TextField label="Username" placeholder="Enter username" />
 *
 * // Required field with support text
 * <TextField
 *   label="Email"
 *   placeholder="Enter email"
 *   required
 *   supportText="We'll never share your email"
 * />
 *
 * // Error state
 * <TextField
 *   label="Password"
 *   error="Password must be at least 8 characters"
 *   value="123"
 * />
 * ```
 */

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  (
    {
      variant = 'default',
      className,
      label = 'ラベル',
      error,
      supportText,
      required = false,
      name,
      id,
      startAdornment,
      endAdornment,
      requiredText = '必須',
      classNames,
      ...rest
    },
    ref,
  ) => {
    const inputVariant = error ? 'error' : variant;
    // Support text stays visible in the error state, with the error message
    // below it — Figma Text Field `Status=Error` (610:2971) shows both
    // (/component TextField sync, 2026-10-05; it used to replace the support
    // text). TextareaField differs on purpose: its own Figma Error variant
    // shows only the error. Each id is described only when its element renders.
    const { fieldId, descriptionId, errorId, describedBy } = useFieldIds(
      id,
      Boolean(supportText),
      Boolean(error),
    );

    return (
      <div className="flex flex-col w-full gap-sds-100">
        {label && (
          <label
            className={cn(
              'text-sds-text-primary flex items-center gap-sds-50 typo-label-m-bold',
              classNames?.label,
            )}
            htmlFor={fieldId}
          >
            {label}
            {required && (
              <span className="text-sds-text-emphasis bg-sds-background-emphasis rounded-sds-100 p-sds-50 typo-label-s-bold">
                {requiredText}
              </span>
            )}
          </label>
        )}
        <Input
          ref={ref}
          variant={inputVariant}
          className={className}
          name={name}
          id={fieldId}
          required={required}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={describedBy}
          startAdornment={startAdornment}
          endAdornment={endAdornment}
          {...rest}
        />
        {supportText && (
          <span
            id={descriptionId}
            className={cn('text-sds-text-secondary typo-body-s', classNames?.supportText)}
          >
            {supportText}
          </span>
        )}
        {error && (
          <div
            id={errorId}
            className={cn(
              'text-sds-text-danger typo-body-s flex items-center gap-sds-50',
              classNames?.error,
            )}
          >
            {/* Figma: Icon/Danger (≠ the message's Text/Danger). */}
            <IconExclamationCircle width={16} height={16} className="text-sds-icon-danger" />
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  },
);

TextField.displayName = 'TextField';
