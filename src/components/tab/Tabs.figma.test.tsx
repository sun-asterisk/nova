import '../../App.css';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@vitest/browser/context';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { tokenColor } from '../../../.storybook/tokenColor';
import { IconFolder } from '../icons';
import { Tabs, TabsList, TabsTrigger } from './Tabs';

// Figma "Tab / Primary" (component set 2185:1731) + the Tab guideline in frame
// 2006:1663 (Nova｜Master) — /component Tab Figma sync, 2026-10-07. Real
// computed styles (App.css loaded), checked in a light AND a dark data-theme
// region against the token resolved inside that region.

const settle = (el: Element) => Promise.all(el.getAnimations().map((a) => a.finished));

describe.each(['light', 'dark'] as const)('Tabs — Figma Tab / Primary (%s)', (theme) => {
  const renderIn = (ui: ReactNode) =>
    render(
      <div data-theme={theme} data-testid="region">
        {ui}
      </div>,
    );
  const tab = (name: string) => screen.getByRole('tab', { name });
  const icon = (el: HTMLElement) => el.querySelector('svg')!;

  // Figma: Icon / Folder 20×20, gap 4px between icon, label and badge,
  // padding 8/16; icon color per State.
  it('icon is 20px, gap 4px; icon color: Enabled icon-secondary, Active icon-primary, Disabled icon-disable', () => {
    renderIn(
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">
            <IconFolder /> Active
          </TabsTrigger>
          <TabsTrigger value="b">
            <IconFolder /> Enabled
          </TabsTrigger>
          <TabsTrigger value="c" disabled>
            <IconFolder /> Disabled
          </TabsTrigger>
        </TabsList>
      </Tabs>,
    );
    const content = tab('Enabled').firstElementChild as HTMLElement;
    expect(getComputedStyle(content).columnGap).toBe('4px');
    const r = icon(tab('Enabled')).getBoundingClientRect();
    expect([r.width, r.height]).toEqual([20, 20]);
    for (const [name, token] of [
      ['Active', '--color-sds-icon-primary'],
      ['Enabled', '--color-sds-icon-secondary'],
      ['Disabled', '--color-sds-icon-disable'],
    ] as const) {
      expect(getComputedStyle(icon(tab(name))).color, name).toBe(tokenColor(tab(name), token));
    }
  });

  it('hover: label text-primary and icon icon-primary-hover', async () => {
    renderIn(
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">A</TabsTrigger>
          <TabsTrigger value="b">
            <IconFolder /> Hover me
          </TabsTrigger>
        </TabsList>
      </Tabs>,
    );
    const el = tab('Hover me');
    await userEvent.hover(el);
    await settle(el);
    await settle(icon(el));
    expect(getComputedStyle(el).color).toBe(tokenColor(el, '--color-sds-text-primary'));
    expect(getComputedStyle(icon(el)).color).toBe(tokenColor(el, '--color-sds-icon-primary-hover'));
  });

  // Guideline: tabs keep their own size and a one-line label; when they do
  // not fit, the list scrolls horizontally (the tabs used to shrink to ~47px
  // and wrap their label onto many lines inside the 40px tab).
  it('many tabs: tabs keep their size on one line and the list scrolls horizontally', () => {
    const labels = [
      'すべて',
      '未読',
      'お届け予定日が変更された注文',
      'キャンセル',
      '返品',
      'お気に入り',
      '履歴',
      '設定',
    ];
    renderIn(
      <div style={{ width: 320 }}>
        <Tabs defaultValue="t0">
          <TabsList data-testid="list">
            {labels.map((l, i) => (
              <TabsTrigger key={l} value={`t${i}`}>
                {l}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>,
    );
    const list = screen.getByTestId('list');
    expect(getComputedStyle(list).overflowX).toBe('auto');
    expect(list.scrollWidth).toBeGreaterThan(list.clientWidth);
    for (const l of labels) {
      const t = tab(l);
      const content = t.firstElementChild as HTMLElement;
      expect(t.getBoundingClientRect().height, l).toBe(40);
      // one line: the label row is no taller than the 16px line plus padding
      expect(content.scrollHeight, `${l} wraps`).toBeLessThanOrEqual(40);
      expect(content.scrollWidth, `${l} squeezed`).toBeLessThanOrEqual(t.clientWidth);
    }
  });

  // The list is a scroll container, so anything drawn below a trigger is
  // clipped: the focus-ring overlay must end inside the list for every tab
  // (it used to extend 2px below inactive tabs and lose its bottom edge).
  it('keyboard focus ring: 2px border-focus, inside the scroll container for active and inactive tabs', async () => {
    renderIn(
      <Tabs defaultValue="a">
        <TabsList data-testid="list">
          <TabsTrigger value="a">Active</TabsTrigger>
          <TabsTrigger value="b">Inactive</TabsTrigger>
        </TabsList>
      </Tabs>,
    );
    const list = screen.getByTestId('list');
    const lr = list.getBoundingClientRect();
    const visibleBottom = lr.top + list.clientTop + list.clientHeight;
    for (const name of ['Active', 'Inactive']) {
      const t = tab(name);
      const ring = t.querySelector<HTMLElement>('[aria-hidden="true"]')!;
      expect(ring.getBoundingClientRect().bottom, name).toBeLessThanOrEqual(visibleBottom);
      expect(ring.getBoundingClientRect().bottom, name).toBe(t.getBoundingClientRect().bottom);
    }
    await userEvent.click(document.body);
    await userEvent.tab();
    const ring = tab('Active').querySelector<HTMLElement>('[aria-hidden="true"]')!;
    const cs = getComputedStyle(ring);
    expect([cs.borderBottomStyle, cs.borderBottomWidth]).toEqual(['solid', '2px']);
    expect(cs.borderBottomColor).toBe(tokenColor(ring, '--color-sds-border-focus'));
  });

  // Guideline: selecting a tab that is cut off scrolls it fully into view, and
  // an edge tab keeps a 16px margin from the list edge; a fully visible tab
  // does not move the list.
  it('selecting a cut-off tab scrolls it fully into view with a 16px margin; a visible tab does not scroll', async () => {
    const labels = Array.from({ length: 10 }, (_, i) => `タブ項目 ${i + 1}`);
    renderIn(
      <div style={{ width: 320 }}>
        <Tabs defaultValue="t0">
          <TabsList data-testid="list">
            {labels.map((l, i) => (
              <TabsTrigger key={l} value={`t${i}`}>
                {l}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>,
    );
    const list = screen.getByTestId('list');
    const visible = () => {
      const lr = list.getBoundingClientRect();
      return (el: HTMLElement) => {
        const r = el.getBoundingClientRect();
        return { left: r.left - lr.left, right: lr.right - r.right };
      };
    };
    // A fully visible tab: no scroll.
    await userEvent.click(tab('タブ項目 2'));
    expect(list.scrollLeft).toBe(0);
    // Keyboard to the last tab (cut off): it scrolls fully into view, 16px from the edge.
    tab('タブ項目 2').focus();
    await userEvent.keyboard('{End}');
    const last = tab('タブ項目 10');
    expect(last).toHaveAttribute('data-state', 'active');
    await expect.poll(() => Math.round(visible()(last).right)).toBe(16);
    // Back to the first tab: 16px from the start edge.
    await userEvent.keyboard('{Home}');
    await expect.poll(() => Math.round(visible()(tab('タブ項目 1')).left)).toBe(16);
  });
});
