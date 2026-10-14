import '../../App.css';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@vitest/browser/context';
import { type ReactNode, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { tokenColor } from '../../../.storybook/tokenColor';
import { IconMail } from '../icons';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from './DropdownMenu';

// Figma "Dropdown Menu" (frame 12669:14631, Nova｜Master): Menu Item set
// 11853:12967 (Style = Action / Option / Danger × State) and the example
// panels (13053:4521 …) — /component DropdownMenu Figma sync, 2026-10-07.
// Real computed styles inside a light AND a dark region (the menu portals
// into the region via `container`).

function Menu({ theme, children }: { theme: 'light' | 'dark'; children: ReactNode }) {
  const [region, setRegion] = useState<HTMLDivElement | null>(null);
  return (
    <div data-theme={theme} ref={setRegion}>
      {region && (
        <DropdownMenu defaultOpen modal={false}>
          <DropdownMenuTrigger>Open</DropdownMenuTrigger>
          <DropdownMenuContent container={region}>{children}</DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

const shadowOf = (token: string, scope: Element) => {
  const probe = document.createElement('div');
  probe.className = token;
  scope.appendChild(probe);
  const value = getComputedStyle(probe).boxShadow;
  probe.remove();
  return value;
};

describe.each(['light', 'dark'] as const)('DropdownMenu — Figma (%s)', (theme) => {
  it('panel: Surface/Base, radius 8, padding 8, Elevation Lv.2, 4px between items', async () => {
    render(
      <Menu theme={theme}>
        <DropdownMenuItem>One</DropdownMenuItem>
        <DropdownMenuItem>Two</DropdownMenuItem>
      </Menu>,
    );
    const panel = await screen.findByRole('menu');
    // Measure after the zoom-in entry animation (its 95% scale skews rects).
    await Promise.all(panel.getAnimations().map((animation) => animation.finished));
    const cs = getComputedStyle(panel);
    expect(cs.backgroundColor).toBe(tokenColor(panel, '--color-sds-surface-base'));
    expect(cs.borderTopLeftRadius).toBe('8px');
    expect(cs.paddingTop).toBe('8px');
    expect(cs.boxShadow).toBe(shadowOf('shadow-sds-level-2', panel));
    const [one, two] = screen.getAllByRole('menuitem');
    expect(two.getBoundingClientRect().top - one.getBoundingClientRect().bottom).toBe(4);
  });

  it('item: min-height 36, padding 12/8, icon/primary icon, text/primary label', async () => {
    render(
      <Menu theme={theme}>
        <DropdownMenuItem>
          <IconMail data-testid="icon" />
          ラベル
        </DropdownMenuItem>
      </Menu>,
    );
    const item = await screen.findByRole('menuitem');
    const cs = getComputedStyle(item);
    expect(item.getBoundingClientRect().height).toBeGreaterThanOrEqual(36);
    expect([cs.paddingLeft, cs.paddingRight, cs.paddingTop]).toEqual(['12px', '8px', '8px']);
    expect(cs.color).toBe(tokenColor(item, '--color-sds-text-primary'));
    expect(getComputedStyle(screen.getByTestId('icon')).color).toBe(
      tokenColor(item, '--color-sds-icon-primary'),
    );
  });

  it("item keeps Figma's 36px min-height even when its content is shorter", async () => {
    render(
      <Menu theme={theme}>
        <DropdownMenuItem className="leading-none">短い</DropdownMenuItem>
      </Menu>,
    );
    const item = await screen.findByRole('menuitem');
    expect(getComputedStyle(item).minHeight).toBe('36px');
    expect(item.offsetHeight).toBe(36);
  });

  it('Danger: text/icon danger; hover/focus uses surface/subtle-hover (no red fill)', async () => {
    render(
      <Menu theme={theme}>
        <DropdownMenuItem destructive>
          <IconMail data-testid="icon" />
          削除
        </DropdownMenuItem>
      </Menu>,
    );
    const item = await screen.findByRole('menuitem');
    expect(getComputedStyle(item).color).toBe(tokenColor(item, '--color-sds-text-danger'));
    expect(getComputedStyle(screen.getByTestId('icon')).color).toBe(
      tokenColor(item, '--color-sds-icon-danger'),
    );
    item.focus();
    await vi.waitFor(() =>
      expect(getComputedStyle(item).backgroundColor).toBe(
        tokenColor(item, '--color-sds-surface-subtle-hover'),
      ),
    );
  });

  it('disabled: label, description, shortcut text/disable; icon icon/disable', async () => {
    render(
      <Menu theme={theme}>
        <DropdownMenuItem disabled description="説明">
          ラベル
        </DropdownMenuItem>
        <DropdownMenuItem disabled>
          <IconMail data-testid="icon" />
          ラベル2
          <DropdownMenuShortcut>⌘A</DropdownMenuShortcut>
        </DropdownMenuItem>
      </Menu>,
    );
    const [withDescription, withIcon] = await screen.findAllByRole('menuitem');
    const disable = tokenColor(withDescription, '--color-sds-text-disable');
    expect(getComputedStyle(withDescription).color).toBe(disable);
    expect(getComputedStyle(screen.getByText('説明')).color).toBe(disable);
    expect(getComputedStyle(screen.getByText('⌘A')).color).toBe(disable);
    expect(getComputedStyle(screen.getByTestId('icon')).color).toBe(
      tokenColor(withIcon, '--color-sds-icon-disable'),
    );
  });

  it('Option: the 20px check sits in the row, so the label starts 40px in (checked or not)', async () => {
    render(
      <Menu theme={theme}>
        <DropdownMenuCheckboxItem checked>選択済み</DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem checked={false}>未選択</DropdownMenuCheckboxItem>
      </Menu>,
    );
    const panel = await screen.findByRole('menu');
    await Promise.all(panel.getAnimations().map((animation) => animation.finished));
    for (const name of ['選択済み', '未選択']) {
      const item = screen.getByRole('menuitemcheckbox', { name });
      const textNode = [...item.childNodes].find((node) => node.nodeType === Node.TEXT_NODE)!;
      const label = document.createRange();
      label.selectNodeContents(textNode);
      expect(
        Math.round(label.getBoundingClientRect().left - item.getBoundingClientRect().left),
      ).toBe(40);
    }
  });

  it('submenu chevron uses icon/secondary', async () => {
    render(
      <Menu theme={theme}>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>その他</DropdownMenuSubTrigger>
        </DropdownMenuSub>
      </Menu>,
    );
    const trigger = await screen.findByRole('menuitem', { name: 'その他' });
    const chevron = trigger.querySelector('svg')!;
    expect(getComputedStyle(chevron).color).toBe(tokenColor(trigger, '--color-sds-icon-secondary'));
  });
});

// Figma 表示と制御: clicking a selection item only toggles its value — the menu
// stays open so several options can be changed in a row. Action items close.
describe('DropdownMenu — selection items keep the menu open (Figma)', () => {
  it('checkbox item toggles without closing; onSelect still fires', async () => {
    const onSelect = vi.fn();
    function Harness() {
      const [checked, setChecked] = useState(false);
      return (
        <DropdownMenu defaultOpen modal={false}>
          <DropdownMenuTrigger>Open</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuCheckboxItem
              checked={checked}
              onCheckedChange={setChecked}
              onSelect={onSelect}
            >
              メール
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
    render(<Harness />);
    const item = await screen.findByRole('menuitemcheckbox');
    await userEvent.click(item);
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(item).toHaveAttribute('aria-checked', 'true');
    await userEvent.click(item);
    expect(item).toHaveAttribute('aria-checked', 'false');
  });

  it('radio item selects without closing', async () => {
    // Radix's menu RadioGroup is controlled-only (no defaultValue).
    function Harness() {
      const [value, setValue] = useState('a');
      return (
        <DropdownMenu defaultOpen modal={false}>
          <DropdownMenuTrigger>Open</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuRadioGroup value={value} onValueChange={setValue}>
              <DropdownMenuRadioItem value="a">A</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="b">B</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
    render(<Harness />);
    await userEvent.click(await screen.findByRole('menuitemradio', { name: 'B' }));
    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getByRole('menuitemradio', { name: 'B' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
  });

  it('an action item still closes the menu', async () => {
    render(
      <DropdownMenu defaultOpen modal={false}>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>編集</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    await userEvent.click(await screen.findByRole('menuitem'));
    await vi.waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
  });
});
