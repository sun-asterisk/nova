import '../../App.css';
import { render, screen } from '@testing-library/react';
import { type ReactNode, useState } from 'react';
import { page } from '@vitest/browser/context';
import { beforeAll, describe, expect, it } from 'vitest';
import { tokenColor } from '../../../.storybook/tokenColor';
import {
  Modal,
  ModalBody,
  ModalContent,
  type ModalContentProps,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from './Modal';

// Figma "Modal" (component set 11017:20474, frame 10837:3946, Nova｜Master) —
// /component Modal Figma sync, 2026-10-07. The dialog portals into a
// `data-theme` region (via `container`) so tokens resolve per theme.

function Open({
  theme,
  content,
  lines = 2,
}: {
  theme: 'light' | 'dark';
  content?: Partial<ModalContentProps>;
  lines?: number;
}) {
  const [region, setRegion] = useState<HTMLDivElement | null>(null);
  return (
    <div data-theme={theme} ref={setRegion}>
      {region && (
        <Modal open>
          <ModalContent container={region} aria-describedby={undefined} {...content}>
            <ModalHeader>
              <ModalTitle>タイトル</ModalTitle>
            </ModalHeader>
            <ModalBody>
              {Array.from({ length: lines }, (_, i) => (
                <p key={i}>メッセージ {i + 1}</p>
              ))}
            </ModalBody>
            <ModalFooter>
              <button type="button">キャンセル</button>
              <button type="button">OK</button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </div>
  );
}

const rect = (el: Element) => el.getBoundingClientRect();

// Desktop viewport: the size classes apply from the `sm` breakpoint (640px).
beforeAll(async () => {
  await page.viewport(1280, 900);
});

describe.each(['light', 'dark'] as const)('Modal — Figma Modal (%s)', (theme) => {
  // Waits for the open zoom/fade animation so measurements see scale 1.
  const show = async (ui: ReactNode) => {
    render(ui);
    const dialog = await screen.findByRole('dialog');
    await Promise.all(dialog.getAnimations().map((a) => a.finished));
    return dialog;
  };
  const part = (dialog: HTMLElement, slot: string) =>
    dialog.querySelector<HTMLElement>(`[data-slot="${slot}"]`)!;

  // Figma: Small 384, Medium 560 (default), Large 768, Auto (content width).
  it.each([
    [undefined, 560],
    ['small', 384],
    ['medium', 560],
    ['large', 768],
  ] as const)('size %s → %ipx wide', async (size, width) => {
    const dialog = await show(<Open theme={theme} content={size ? { size } : {}} />);
    expect(rect(dialog).width).toBe(width);
  });

  it('size auto: width follows the content (narrower than Medium for short content)', async () => {
    const dialog = await show(<Open theme={theme} content={{ size: 'auto' }} />);
    expect(rect(dialog).width).toBeLessThan(384);
  });

  it('surface: radius 16, Background/Base, Lv.5 shadow, 24px header padding, 16px bold title', async () => {
    const dialog = await show(<Open theme={theme} />);
    const cs = getComputedStyle(dialog);
    expect(cs.borderTopLeftRadius).toBe('16px');
    expect(cs.backgroundColor).toBe(tokenColor(dialog, '--color-sds-background-base'));
    expect(cs.boxShadow).not.toBe('none');
    const header = getComputedStyle(part(dialog, 'modal-header'));
    expect([header.paddingTop, header.paddingLeft]).toEqual(['24px', '24px']);
    const title = getComputedStyle(screen.getByText('タイトル'));
    expect([title.fontSize, title.fontWeight]).toEqual(['16px', '700']);
    expect(title.color).toBe(tokenColor(dialog, '--color-sds-text-primary'));
  });

  // Figma "+ Status Icon": a 24px status icon, 12px before the title; body and
  // footer start at the title's left edge (60px).
  it('status: 24px icon before the title; body and footer aligned with the title (60px)', async () => {
    const dialog = await show(<Open theme={theme} content={{ status: 'danger' }} />);
    const icon = part(dialog, 'modal-header').querySelector('svg')!;
    const title = screen.getByText('タイトル');
    expect(rect(icon).width).toBeGreaterThanOrEqual(20);
    expect(getComputedStyle(icon).color).toBe(tokenColor(dialog, '--color-sds-icon-danger'));
    const titleLeft = rect(title).left - rect(dialog).left;
    expect(titleLeft).toBe(60);
    const message = screen.getByText('メッセージ 1');
    expect(rect(message).left - rect(dialog).left).toBe(60);
    const cancel = screen.getByRole('button', { name: 'キャンセル' });
    expect(rect(cancel).left - rect(dialog).left).toBeGreaterThanOrEqual(60);
    expect(getComputedStyle(part(dialog, 'modal-footer')).paddingLeft).toBe('60px');
  });

  it('no status: body starts at the 24px padding', async () => {
    const dialog = await show(<Open theme={theme} />);
    expect(rect(screen.getByText('メッセージ 1')).left - rect(dialog).left).toBe(24);
  });

  // Long content scrolls inside the Sun Scrollbar viewport (Figma Scrollbar
  // Rail) instead of being clipped; the modal keeps an 80px margin top/bottom.
  it('long content: max height leaves 80px top and bottom; the body viewport scrolls', async () => {
    const dialog = await show(<Open theme={theme} lines={120} />);
    expect(Math.round(rect(dialog).height)).toBe(window.innerHeight - 160);
    const viewport = part(dialog, 'modal-body').querySelector<HTMLElement>(
      '[data-slot="scroll-area-viewport"]',
    )!;
    expect(viewport.scrollHeight).toBeGreaterThan(viewport.clientHeight);
    viewport.scrollTop = viewport.scrollHeight;
    expect(viewport.scrollTop).toBeGreaterThan(0);
    // The footer stays inside the dialog (not pushed out by the content).
    expect(rect(part(dialog, 'modal-footer')).bottom).toBeLessThanOrEqual(rect(dialog).bottom);
  });

  it('scrim: Background/Scrim behind the dialog, covering the viewport', async () => {
    const dialog = await show(<Open theme={theme} />);
    const scrim = dialog.ownerDocument.querySelector<HTMLElement>('[data-slot="modal-overlay"]')!;
    const cs = getComputedStyle(scrim);
    expect(cs.backgroundColor).toBe(tokenColor(scrim, '--color-sds-background-scrim'));
    expect([cs.position, rect(scrim).width, rect(scrim).height]).toEqual([
      'fixed',
      window.innerWidth,
      window.innerHeight,
    ]);
  });
});
