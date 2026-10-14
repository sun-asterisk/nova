import { tv } from 'tailwind-variants';

// Figma's Divider (nodes 977:1950/2692:1756) is a literal 1px `stroke`
// line, `#E7E7E7` (= `border-weak`). Per orientation below uses a single
// directional border (`border-t`/`border-l`) on a 0-sized box, matching
// that exactly — `border-t` alone is 1px (Tailwind's default border
// width). A prior version used the unconditional `border` (all 4 sides)
// alongside a contradictory `border-none` in the same string: tailwind-
// merge drops the earlier `border-none` when a later `border` utility is
// present (the same conflict-resolution behavior documented in
// Checkbox.styles.ts's comment for `outline`), so the divider actually
// rendered a full border box, not a single edge — a real, confirmed 2px
// line (1px top + 1px bottom border stacked on a 0-height box) instead of
// Figma's 1px. Don't reintroduce a bare `border`/`border-none` pairing
// here.
//
// Deliberately NO built-in margin: Figma's own real usage examples show
// the gap around a divider varies by context (8px between dense list
// items, 16px inside a card/module, 32px between page-level sections) —
// there is no single "correct" default, so margin is left entirely to the
// consumer's own layout (a wrapping element's margin, or a flex `gap`),
// matching MUI/Ant Design's Divider convention. This is a deliberate
// behavior change from the previous unconditional `my-[8px]`/`mx-[8px]`.
export const dividerStyles = tv({
  base: `
    box-border relative flex-shrink-0
    border-solid border-sds-border-weak
  `,
  variants: {
    orientation: {
      horizontal: `
        w-full h-0 border-t
      `,
      vertical: `
        h-full w-0 border-l
      `,
    },
    flexItem: {
      true: `
        self-stretch
      `,
    },
  },
  defaultVariants: {
    orientation: 'horizontal',
  },
});
