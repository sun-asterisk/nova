import { cn } from '@/utils';
import { type ComponentProps, forwardRef, useId, useMemo } from 'react';
import { textareaStyles } from './Textarea.styles';

/** Available textarea visual state variants */
export type TextareaVariant = 'default' | 'error';

/**
 * Textarea component props extending standard HTML textarea attributes
 */
export type TextareaProps = ComponentProps<'textarea'> & {
  /** Visual state variant of the textarea field @default 'default' */
  variant?: TextareaVariant;
  /** Unique identifier for the textarea element. If not provided, an auto-generated ID will be used */
  id?: string;
};

/**
 * A flexible textarea component with support for different states and customizable styling.
 * Used as the foundation for more complex form components like TextareaField.
 *
 * @example
 * ```tsx
 * // Basic textarea
 * <Textarea placeholder="Enter text" />
 *
 * // Error state
 * <Textarea variant="error" placeholder="Fix this field" />
 * ```
 */

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    { id, variant = 'default', className, placeholder = 'テキストを入力', disabled, ...rest },
    ref,
  ) => {
    const autoId = useId();
    const textareaClassName = useMemo(
      () => cn(textareaStyles({ variant, disabled: Boolean(disabled) }), className),
      [variant, disabled, className],
    );

    return (
      <textarea
        id={id || autoId}
        ref={ref}
        className={textareaClassName}
        placeholder={placeholder}
        disabled={disabled}
        {...rest}
      />
    );
  },
);

Textarea.displayName = 'Textarea';
