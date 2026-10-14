/**
 * Public API contract fixtures for `Avatar` — type-only checks (never
 * executed at runtime), run via `pnpm test:api`. See
 * docs/architecture/component-api-conventions.md §15 for the full rationale
 * and the one-file-per-component convention this file follows.
 */
import { expectTypeOf } from 'vitest';
import type { ComponentRef, ReactNode } from 'react';
import {
  Avatar,
  type AvatarProps,
  type AvatarSize,
  type AvatarStatusValue,
} from '@/components/avatar';

// --- Own props, checked individually (§15.2 item 1) -------------------------

expectTypeOf<AvatarProps['size']>().toEqualTypeOf<AvatarSize | undefined>();
expectTypeOf<AvatarProps['src']>().toEqualTypeOf<string | undefined>();
expectTypeOf<AvatarProps['alt']>().toEqualTypeOf<string | undefined>();
expectTypeOf<AvatarProps['initial']>().toEqualTypeOf<string | undefined>();
expectTypeOf<AvatarProps['icon']>().toEqualTypeOf<ReactNode | undefined>();
expectTypeOf<AvatarProps['ring']>().toEqualTypeOf<boolean | undefined>();
expectTypeOf<AvatarProps['status']>().toEqualTypeOf<AvatarStatusValue | undefined>();
expectTypeOf<AvatarProps['statusLabel']>().toEqualTypeOf<string | undefined>();

// --- Unions checked exhaustively — every member, not sampled (§15.2 item 2) -

expectTypeOf<AvatarSize>().toEqualTypeOf<'xsmall' | 'small' | 'medium' | 'large' | 'xlarge'>();
expectTypeOf<AvatarStatusValue>().toEqualTypeOf<'online' | 'away' | 'busy' | 'offline'>();

// --- Usage: every prop, every size, every status value, including a
// commented invalid-usage example under the discriminant `status` prop
// (§15.2 items 6, 9) --------------------------------------------------------

() => <Avatar />;
() => <Avatar src="/photo.jpg" alt="Jane Doe" />;
() => <Avatar initial="鈴" />;
() => <Avatar icon={<span />} />;
() => <Avatar ring />;
() => <Avatar ring={false} />;
() => <Avatar size="xsmall" />;
() => <Avatar size="small" />;
() => <Avatar size="medium" />;
() => <Avatar size="large" />;
() => <Avatar size="xlarge" />;
() => <Avatar status="online" />;
() => <Avatar status="away" />;
() => <Avatar status="busy" />;
() => <Avatar status="offline" />;
() => <Avatar status="online" statusLabel="オンライン" />;
// @ts-expect-error 'invisible' is not a valid AvatarStatusValue
() => <Avatar status="invisible" />;
() => (
  <Avatar
    size="large"
    src="/photo.jpg"
    alt="Jane Doe"
    initial="J"
    icon={<span />}
    ring
    status="online"
    statusLabel="Online"
  />
);

// --- Ref (§15.2 item 5) ------------------------------------------------------

expectTypeOf<ComponentRef<typeof Avatar>>().toEqualTypeOf<HTMLSpanElement>();
