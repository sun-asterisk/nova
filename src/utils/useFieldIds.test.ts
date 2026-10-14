import { describe, expect, it } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useFieldIds } from './useFieldIds';

describe('useFieldIds', () => {
  it('uses the provided id instead of generating one', () => {
    const { result } = renderHook(() => useFieldIds('my-field', false, false));
    expect(result.current.fieldId).toBe('my-field');
  });

  it('falls back to a generated id when none is provided', () => {
    const { result } = renderHook(() => useFieldIds(undefined, false, false));
    expect(result.current.fieldId).toBeTruthy();
  });

  it('derives descriptionId/errorId from the field id', () => {
    const { result } = renderHook(() => useFieldIds('email', true, true));
    expect(result.current.descriptionId).toBe('email-description');
    expect(result.current.errorId).toBe('email-error');
  });

  it('describedBy is undefined when there is no description and no error', () => {
    const { result } = renderHook(() => useFieldIds('email', false, false));
    expect(result.current.describedBy).toBeUndefined();
  });

  it('describedBy includes only errorId when only an error is present', () => {
    const { result } = renderHook(() => useFieldIds('email', false, true));
    expect(result.current.describedBy).toBe('email-error');
  });

  it('describedBy includes error before description, per aria-describedby convention (error is more urgent)', () => {
    const { result } = renderHook(() => useFieldIds('email', true, true));
    expect(result.current.describedBy).toBe('email-error email-description');
  });
});
