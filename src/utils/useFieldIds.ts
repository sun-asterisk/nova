import { useId } from 'react';

/**
 * Foundation Capability (see component-development-system.md §11.1) — a
 * shared implementation with a documented consumer-evidence/Stop-Condition
 * lineage, distinct from this directory's generic utilities (style.ts).
 * Internal-only: verified unreachable via any deep-import path against the
 * real packed tarball (scripts/quality/verify-package.mjs).
 *
 * Generates the id wiring a labelled form field needs: a stable field id
 * (falls back to `useId()` when the consumer doesn't supply one), and the
 * `aria-describedby` value linking the field to its error/description text.
 *
 * Centralizes what TextField/TextareaField previously duplicated (and got
 * wrong identically in both places — `htmlFor` pointed at `name` instead of
 * `id`, and neither wired `aria-describedby`/`aria-invalid` at all).
 */
export function useFieldIds(
  providedId: string | undefined,
  hasDescription: boolean,
  hasError: boolean,
) {
  const generatedId = useId();
  const fieldId = providedId ?? generatedId;
  const descriptionId = `${fieldId}-description`;
  const errorId = `${fieldId}-error`;

  const describedBy =
    [hasError && errorId, hasDescription && descriptionId].filter(Boolean).join(' ') || undefined;

  return { fieldId, descriptionId, errorId, describedBy };
}
