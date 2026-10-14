import { type ComponentProps, forwardRef, useState, type ChangeEvent } from 'react';
import { Textarea, type TextareaVariant } from '../textarea';
import { IconExclamationCircle } from '../icons';
import { cn, useFieldIds } from '@/utils';

/** TextareaField variant inherits from Textarea variant */
export type TextareaFieldVariant = TextareaVariant;

/**
 * TextareaField component props extending standard HTML textarea attributes
 */
export type TextareaFieldProps = Omit<ComponentProps<'textarea'>, 'size'> & {
  /** Visual style variant of the textarea field @default 'default' */
  variant?: TextareaFieldVariant;
  /** Label text displayed above the textarea field @default 'ラベル' */
  label?: string;
  /** Error message to display below the textarea. When provided, the textarea will show error state */
  error?: string;
  /** Helper text displayed below the textarea to provide additional context or instructions */
  supportText?: string;
  /** Whether the field is required. Shows a required indicator next to the label @default false */
  required?: boolean;
  /** Maximum character length for the textarea. Shows character counter when provided */
  maxLength?: number;
  /** Custom text for the required indicator badge @default '必須' */
  requiredText?: string;
  /** Additional class names applied to specific internal parts, for customization beyond the root `className` (which reaches only the leaf textarea). */
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
 * A textarea field component that combines a textarea with label, validation, character counting, and helper text functionality.
 * Built on top of the Textarea component with additional form-related features.
 *
 * @example
 * ```tsx
 * // Basic textarea field
 * <TextareaField label="Description" placeholder="Enter description" />
 *
 * // Required field with support text and character limit
 * <TextareaField
 *   label="Message"
 *   placeholder="Enter message"
 *   required
 *   maxLength={500}
 *   supportText="Please provide detailed information"
 * />
 *
 * // Error state
 * <TextareaField
 *   label="Comments"
 *   error="Comments are required"
 *   value=""
 * />
 * ```
 */

export const TextareaField = forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
  (
    {
      variant = 'default',
      className,
      label = 'ラベル',
      error,
      supportText,
      required = false,
      maxLength,
      name,
      id,
      value,
      defaultValue,
      onChange,
      requiredText = '必須',
      classNames,
      ...rest
    },
    ref,
  ) => {
    // Only used for the UNCONTROLLED case, updated synchronously in
    // handleChange. When controlled, the displayed length is derived
    // directly from `value` at render time below instead — deriving it via
    // an effect (as this previously did for both cases) meant a `value`
    // change coming from outside this component's own onChange (e.g. an
    // external "Clear" button) painted the new value while the counter
    // still showed the stale length for one render.
    const [uncontrolledTextLength, setUncontrolledTextLength] = useState(
      () => defaultValue?.toString().length ?? 0,
    );

    const displayedLength = value != null ? value.toString().length : uncontrolledTextLength;

    const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
      setUncontrolledTextLength(e.target.value.length);
      onChange?.(e);
    };

    const textareaVariant = error ? 'error' : variant;
    // The error message REPLACES support text in the shared row below (see
    // render), so only count the description as present when it will
    // actually render — otherwise aria-describedby would dangle-reference
    // an id that never mounts whenever both props are supplied together.
    const { fieldId, descriptionId, errorId, describedBy } = useFieldIds(
      id,
      Boolean(supportText) && !error,
      Boolean(error),
    );

    return (
      <div className="flex flex-col w-full gap-sds-100">
        {label && (
          <label
            className={cn(
              'text-sds-text-primary flex items-center gap-sds-100 typo-label-m-bold',
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
        <Textarea
          ref={ref}
          variant={textareaVariant}
          className={className}
          name={name}
          id={fieldId}
          required={required}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={describedBy}
          value={value}
          defaultValue={defaultValue}
          maxLength={maxLength}
          onChange={handleChange}
          {...rest}
        />
        {(supportText || error || maxLength) && (
          <div className="flex items-center justify-end gap-sds-200">
            {error ? (
              <div
                id={errorId}
                className={cn(
                  'text-sds-text-danger typo-body-s flex-1 flex items-center gap-sds-50 min-w-0',
                  classNames?.error,
                )}
              >
                {/* Figma: Icon/Danger (≠ the message's Text/Danger). */}
                <IconExclamationCircle width={16} height={16} className="text-sds-icon-danger" />
                <span>{error}</span>
              </div>
            ) : (
              supportText && (
                <span
                  id={descriptionId}
                  className={cn(
                    'text-sds-text-secondary typo-body-s flex-1 min-w-0',
                    classNames?.supportText,
                  )}
                >
                  {supportText}
                </span>
              )
            )}
            {maxLength && (
              <div
                aria-live="polite"
                className={cn(
                  'typo-body-s shrink-0',
                  displayedLength > maxLength || error
                    ? 'text-sds-text-danger'
                    : 'text-sds-text-secondary',
                )}
              >
                {displayedLength} / {maxLength}
              </div>
            )}
          </div>
        )}
      </div>
    );
  },
);

TextareaField.displayName = 'TextareaField';
