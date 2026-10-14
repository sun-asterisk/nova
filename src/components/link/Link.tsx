import { cn } from '@/utils';
import { Slot } from 'radix-ui';
import {
  type ComponentProps,
  forwardRef,
  isValidElement,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import { linkStyles } from './Link.styles';

/** Available link sizes */
export type LinkSize = 'large' | 'medium' | 'small';

/**
 * Link component props extending standard HTML anchor attributes.
 */
export type LinkProps = ComponentProps<'a'> & {
  /** Size of the link, driving its typography scale @default 'large' */
  size?: LinkSize;
  /**
   * Renders as non-interactive text instead of a real anchor. Figma's own
   * accessibility guidance for this component is explicit: disabled must be
   * "非対話のテキストとして描画" (rendered as non-interactive text), not a
   * disabled `<a>` — anchors have no native `disabled` attribute/semantics
   * to begin with. `href`/`onClick`/`target`/`rel` are intentionally not
   * forwarded to the rendered `<span>` when true.
   * @default false
   */
  disabled?: boolean;
  /**
   * Icon or element displayed before the label — for indicating navigation
   * direction/target (per Figma: "Prefix アイコン: 遷移の方向や対象を補足").
   */
  startAdornment?: ReactNode;
  /**
   * Icon or element displayed after the label — commonly `IconExternalLink`
   * for links leaving the current site (per Figma: "Suffix アイコン: 遷移の
   * 結果や動作を示唆").
   */
  endAdornment?: ReactNode;
  /**
   * Merges Link's styling and props onto its single child element instead
   * of rendering an `<a>` — for router links (React Router `<Link>`/
   * `<NavLink>`, Next.js `<Link>`), which must render their own anchor to
   * handle client-side navigation. `startAdornment`/`endAdornment` are
   * placed inside the child. With `disabled`, the child is NOT rendered
   * (no navigation is possible) — its text content renders as the
   * non-interactive `<span>` instead.
   * @default false
   */
  asChild?: boolean;
};

/**
 * A standalone text link for page transitions or navigation to an external
 * site — not for executing an action or opening/closing a dialog (use
 * `Button` for those; Figma's own guideline is explicit about this
 * distinction).
 *
 * The underline is always shown (never removed) and never changes color on
 * hover — only its thickness (1px → 2px) — so link state is never
 * identifiable by color alone.
 *
 * @example
 * ```tsx
 * // Basic link
 * <Link href="/settings">Settings</Link>
 *
 * // External link with a suffix icon
 * <Link href="https://example.com" target="_blank" rel="noopener noreferrer" endAdornment={<IconExternalLink />}>
 *   Visit our site
 * </Link>
 *
 * // Router link (React Router / Next.js) — Link styles the router's own anchor
 * <Link asChild>
 *   <RouterLink to="/settings">Settings</RouterLink>
 * </Link>
 *
 * // Smaller size, disabled (renders as non-interactive text, not a disabled <a>)
 * <Link size="small" disabled>
 *   Unavailable
 * </Link>
 * ```
 */
export const Link = forwardRef<HTMLAnchorElement | HTMLSpanElement, LinkProps>(
  (
    {
      size = 'large',
      disabled = false,
      startAdornment,
      endAdornment,
      className,
      children,
      asChild = false,
      ...rest
    },
    ref,
  ) => {
    const linkClassName = cn(linkStyles({ size, disabled }), className);
    // With asChild + disabled the child (e.g. a router link) is dropped —
    // only its label is kept, rendered as non-interactive text below.
    const label =
      asChild && disabled && isValidElement(children)
        ? (children as ReactElement<{ children?: ReactNode }>).props.children
        : children;
    const content = (
      <>
        {startAdornment}
        {label}
        {endAdornment}
      </>
    );

    if (disabled) {
      // href/onClick/target/rel deliberately excluded — see the `disabled`
      // prop's own doc comment above.
      const { href: _href, onClick: _onClick, target: _target, rel: _rel, ...safeRest } = rest;
      void _href;
      void _onClick;
      void _target;
      void _rel;
      return (
        <span
          ref={ref as Ref<HTMLSpanElement>}
          className={linkClassName}
          aria-disabled="true"
          {...safeRest}
        >
          {content}
        </span>
      );
    }

    if (asChild) {
      // Slottable: the adornments become siblings of the child's own
      // children inside the child element (Radix Slot composition).
      return (
        <Slot.Root ref={ref as Ref<HTMLAnchorElement>} className={linkClassName} {...rest}>
          {startAdornment}
          <Slot.Slottable>{children}</Slot.Slottable>
          {endAdornment}
        </Slot.Root>
      );
    }

    return (
      <a ref={ref as Ref<HTMLAnchorElement>} className={linkClassName} {...rest}>
        {content}
      </a>
    );
  },
);

Link.displayName = 'Link';
