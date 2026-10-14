import { describe, expect, it } from 'vitest';
import { cn } from './style';

describe('cn()', () => {
  it('merges plain string classes in order', () => {
    expect(cn('a', 'b', 'c')).toBe('a b c');
  });

  it('drops falsy values (undefined, null, false, empty string)', () => {
    expect(cn('a', undefined, null, false, '', 'b')).toBe('a b');
  });

  it('supports object syntax (clsx-style conditional classes)', () => {
    expect(cn({ a: true, b: false, c: true })).toBe('a c');
  });

  it('supports arrays and nested arrays', () => {
    expect(cn(['a', ['b', 'c']])).toBe('a b c');
  });

  it('resolves conflicting Tailwind utilities, keeping the last one (tailwind-merge behavior)', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4');
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
  });

  it('does not merge non-conflicting utilities', () => {
    expect(cn('p-2', 'text-red-500', 'rounded-md')).toBe('p-2 text-red-500 rounded-md');
  });

  it('resolves conflicts across arbitrary values', () => {
    expect(cn('outline-2', 'outline-[3px]')).toBe('outline-[3px]');
  });

  it('lets a later className prop override an earlier base class, the standard component-composition use case', () => {
    const base = 'flex items-center p-2';
    const consumerOverride = 'p-4';
    expect(cn(base, consumerOverride)).toBe('flex items-center p-4');
  });

  it('returns an empty string when given nothing usable', () => {
    expect(cn()).toBe('');
    expect(cn(undefined, null, false)).toBe('');
  });
});
