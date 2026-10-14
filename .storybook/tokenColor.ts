/**
 * Resolves a design-token color the way an element would see it — inside its
 * own `data-theme` region / portal — and returns it in the same format
 * `getComputedStyle()` reports colors (`rgb(...)` / `rgba(...)`).
 *
 * Story play() functions compare a rendered color against this instead of a
 * hardcoded value, so the same assertion ("this part uses token X") holds in
 * the light Storybook project and in `storybook-dark` (2026-10-05: four
 * stories hardcoded light-mode values and failed the dark pass for that
 * reason alone). Story-test-only; never shipped.
 */
// Elements that cannot render children — a probe appended to them is never
// laid out and computes to '' (found 2026-10-05 with an <input>).
const VOID_ELEMENTS = new Set(['INPUT', 'TEXTAREA', 'IMG', 'BR', 'HR', 'SELECT']);

export function tokenColor(scope: Element, token: `--color-sds-${string}`): string {
  const host =
    VOID_ELEMENTS.has(scope.tagName) && scope.parentElement ? scope.parentElement : scope;
  const probe = host.ownerDocument.createElement('span');
  probe.style.color = `var(${token})`;
  host.appendChild(probe);
  const value = getComputedStyle(probe).color;
  probe.remove();
  return value;
}
