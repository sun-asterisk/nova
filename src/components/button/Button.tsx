import { cn } from '@/utils';
import { Slot } from '@radix-ui/react-slot';
import { type ComponentProps, forwardRef, useMemo } from 'react';
import { buttonStyles } from './Button.styles';

/** Available button style variants */
export type ButtonVariant = 'primary' | 'secondary' | 'emphasis' | 'plain' | 'danger';

/** Available button sizes */
export type ButtonSize = 'small' | 'medium' | 'large';

/**
 * Button component props extending standard HTML button attributes
 */
export type ButtonProps = ComponentProps<'button'> & {
  /** Visual style variant of the button @default 'primary' */
  variant?: ButtonVariant;
  /** Size of the button affecting padding and font size @default 'small' */
  size?: ButtonSize;
  /**
   * When true, merges Button's props/styling/ref onto a single child element
   * instead of rendering its own `<button>` — use this to render Button's
   * visual treatment on a different semantic element, most commonly a link.
   * The child is responsible for its own accessible role/semantics.
   * @default false
   *
   * @example
   * ```tsx
   * <Button asChild variant="primary">
   *   <Link to="/settings">Settings</Link>
   * </Button>
   * ```
   */
  asChild?: boolean;
  /**
   * Renders Figma's **Icon Button**: a square button (width = height:
   * 32/40/48px for small/medium/large) for a single icon child, without the
   * label-sized `min-width`. There is no visible text, so give it an
   * accessible name with `aria-label` (or `aria-labelledby` / `title`).
   * @default false
   *
   * @example
   * ```tsx
   * <Button iconOnly variant="plain" aria-label="Close">
   *   <IconCross />
   * </Button>
   * ```
   */
  iconOnly?: boolean;
};

let hasWarnedUnnamedIconOnly = false;

function warnUnnamedIconOnlyOnce(): void {
  if (hasWarnedUnnamedIconOnly) return;
  hasWarnedUnnamedIconOnly = true;
  console.warn(
    '[Sun Button] `iconOnly` renders no visible text. Screen-reader users hear ' +
      'nothing unless you provide an accessible name, e.g. ' +
      '<Button iconOnly aria-label="Close">…</Button> (or aria-labelledby / title).',
  );
}

/**
 * A flexible button component with multiple variants, sizes, and support for icons.
 * Built with accessibility and modern design principles in mind.
 *
 * @example
 * ```tsx
 * // Basic button
 * <Button variant="primary" size="medium">
 *   Click me
 * </Button>
 *
 * // Button with icon
 * <Button variant="secondary" size="large">
 *   <MdAdd />
 *   Add Item
 * </Button>
 * ```
 */

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'small',
      className,
      children,
      type = 'button',
      asChild = false,
      iconOnly = false,
      ...rest
    },
    ref,
  ) => {
    const buttonClassName = useMemo(
      () =>
        cn(
          buttonStyles({
            variant,
            size,
            iconOnly,
          }),
          className,
        ),
      [variant, size, iconOnly, className],
    );

    // During render, not in an effect: Button must stay usable from a React
    // Server Component (same pattern as Badge's unlabeled-dot warning).
    // Skipped for `asChild`, where the child element owns its semantics.
    if (iconOnly && !asChild && !rest['aria-label'] && !rest['aria-labelledby'] && !rest.title) {
      warnUnnamedIconOnlyOnce();
    }

    if (asChild) {
      return (
        <Slot ref={ref} className={buttonClassName} {...rest}>
          {children}
        </Slot>
      );
    }

    return (
      <button ref={ref} type={type} className={buttonClassName} {...rest}>
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
