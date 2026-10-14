import '../../App.css';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { tokenColor } from '../../../.storybook/tokenColor';
import { Snackbar, type SnackbarVariant } from './Snackbar';

// Figma "Snackbar" (7837:3652, frame 7637:4257, Nova｜Master) —
// /component Snackbar Figma sync, 2026-10-07. Real computed styles (App.css
// loaded), in a light AND a dark data-theme region, against the token
// resolved inside that region.

const noop = () => {};

describe.each(['light', 'dark'] as const)('Snackbar — Figma Snackbar (%s)', (theme) => {
  const renderIn = (ui: ReactNode) =>
    render(
      <div data-theme={theme} data-testid="region" style={{ width: 1000 }}>
        {ui}
      </div>,
    );
  const rect = (el: Element) => el.getBoundingClientRect();
  const centerY = (el: Element) => rect(el).top + rect(el).height / 2;

  // Rendered in a shrink-to-content flex parent (like a toaster): a fixed
  // 400px width must not collapse around a short message.
  it('container: fixed 400px, 16px padding, radius 8, container-inverse, Lv.4 shadow', () => {
    renderIn(
      <div style={{ display: 'flex', alignItems: 'flex-start' }}>
        <Snackbar data-testid="sb" message="短い" duration={false} closable={false} />
      </div>,
    );
    const el = screen.getByTestId('sb');
    const cs = getComputedStyle(el);
    expect(rect(el).width).toBe(400);
    expect([cs.paddingTop, cs.paddingLeft]).toEqual(['16px', '16px']);
    expect(cs.borderTopLeftRadius).toBe('8px');
    expect(cs.backgroundColor).toBe(tokenColor(el, '--color-sds-background-container-inverse'));
    expect(cs.boxShadow).not.toBe('none');
  });

  // Figma embeds Status Icon with Inverse = True; the close icon is
  // Icon/Secondary Inverse (it used to be the non-inverse tokens).
  it.each([
    ['info', '--color-sds-icon-info-inverse'],
    ['success', '--color-sds-icon-success-inverse'],
    ['warning', '--color-sds-icon-caution-inverse'],
    ['error', '--color-sds-icon-danger-inverse'],
  ] as const)('%s: inverse status icon color; close icon secondary-inverse', (variant, token) => {
    renderIn(
      <Snackbar
        data-testid="sb"
        variant={variant as SnackbarVariant}
        message="m"
        duration={false}
      />,
    );
    const el = screen.getByTestId('sb');
    const icon = el.querySelector('svg')!;
    expect(getComputedStyle(icon).color).toBe(tokenColor(el, token));
    const close = screen.getByRole('button', { name: 'Close notification' });
    expect(getComputedStyle(close).color).toBe(
      tokenColor(el, '--color-sds-icon-secondary-inverse'),
    );
    expect([rect(icon).width, rect(icon).height]).toEqual([20, 20]);
  });

  it('loading: spinner icon and an 8px inverse progress bar with the given value', () => {
    renderIn(
      <Snackbar data-testid="sb" variant="loading" message="アップロード中…" progress={68} />,
    );
    const el = screen.getByTestId('sb');
    const bar = screen.getByRole('progressbar', { name: 'アップロード中…' });
    expect(bar).toHaveAttribute('aria-valuenow', '68');
    expect(rect(bar).height).toBe(8);
    expect(getComputedStyle(bar).backgroundColor).toBe(
      tokenColor(el, '--color-sds-surface-subtle-inverse'),
    );
    expect(getComputedStyle(bar.firstElementChild!).backgroundColor).toBe(
      tokenColor(el, '--color-sds-icon-primary-inverse'),
    );
  });

  it('no progress bar unless `progress` is given (no countdown bar)', () => {
    renderIn(<Snackbar message="Saved" duration={4000} />);
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  // Figma: icon and close icon are vertically centered on the first text line
  // (22px containers); the title box is 22px and the message starts 8px below.
  it('alignment: title 22px, message 8px below, icon and close centered on the first line', () => {
    renderIn(<Snackbar data-testid="sb" title="タイトル" message="メッセージ" duration={false} />);
    const el = screen.getByTestId('sb');
    const title = screen.getByText('タイトル').parentElement!;
    const message = screen.getByText('メッセージ');
    expect(rect(title).height).toBe(22);
    expect(rect(message).top - rect(title).bottom).toBe(8);
    const icon = el.querySelector('svg')!;
    const close = screen.getByRole('button', { name: 'Close notification' }).querySelector('svg')!;
    expect(centerY(icon)).toBe(centerY(title));
    expect(centerY(close)).toBe(centerY(title));
  });

  it('message only: icon centered on the first 22px message line; Body M on-surface', () => {
    renderIn(<Snackbar data-testid="sb" message="アカウント情報を更新しました" duration={false} />);
    const el = screen.getByTestId('sb');
    const message = screen.getByText('アカウント情報を更新しました');
    const cs = getComputedStyle(message);
    expect([cs.fontSize, cs.fontWeight]).toEqual(['14px', '400']);
    expect(cs.color).toBe(tokenColor(el, '--color-sds-text-on-surface'));
    const icon = el.querySelector('svg')!;
    expect(Math.round(centerY(icon) - rect(message).top)).toBe(11);
  });

  it('actions: 32px buttons, 8px apart, subtle-inverse fill, on-surface 12px bold label', () => {
    renderIn(
      <Snackbar
        data-testid="sb"
        message="m"
        duration={false}
        actions={[
          { label: '元に戻す', onClick: noop },
          { label: 'ラベル', onClick: noop },
        ]}
      />,
    );
    const el = screen.getByTestId('sb');
    const [a, b] = [
      screen.getByRole('button', { name: '元に戻す' }),
      screen.getByRole('button', { name: 'ラベル' }),
    ];
    expect(rect(a).height).toBe(32);
    expect(rect(b).left - rect(a).right).toBe(8);
    const cs = getComputedStyle(a);
    expect(cs.backgroundColor).toBe(tokenColor(el, '--color-sds-surface-subtle-inverse'));
    expect(cs.color).toBe(tokenColor(el, '--color-sds-text-on-surface'));
    expect([cs.fontSize, cs.fontWeight]).toEqual(['12px', '700']);
  });
});
