import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from 'storybook/test';
import { createRef } from 'react';
import {
  Modal,
  ModalClose,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  ModalTrigger,
} from './Modal';

// Regression coverage for a previously-zero-coverage gap: Modal had no
// `.test.tsx` at all (only Storybook stories/play tests). Note:
// scroll-divider behavior (the 2026-09-07 Figma-fidelity audit's main
// addition) is deliberately verified in Modal.stories.tsx's `LongContent`
// `play()`, not here — this file's "unit" Vitest project renders components
// without the real compiled Tailwind stylesheet, so `getComputedStyle`
// border-color assertions here would silently check browser defaults
// instead of the actual design tokens (same reasoning as Badge.test.tsx).
describe('Modal', () => {
  it('forwards a ref to the trigger element', () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <Modal>
        <ModalTrigger ref={ref} asChild>
          <button>Open</button>
        </ModalTrigger>
        <ModalContent>
          <ModalTitle>Title</ModalTitle>
        </ModalContent>
      </Modal>,
    );
    expect(ref.current).toBe(screen.getByRole('button', { name: 'Open' }));
  });

  it('forwards a ref to the content element while open', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Modal defaultOpen>
        <ModalTrigger asChild>
          <button>Open</button>
        </ModalTrigger>
        <ModalContent ref={ref}>
          <ModalTitle>Title</ModalTitle>
        </ModalContent>
      </Modal>,
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toBe(screen.getByRole('dialog'));
  });

  it('ModalHeader shows the close button by default and hides it when showCloseButton is false', () => {
    const { rerender } = render(
      <Modal defaultOpen>
        <ModalTrigger asChild>
          <button>Open</button>
        </ModalTrigger>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Title</ModalTitle>
          </ModalHeader>
        </ModalContent>
      </Modal>,
    );
    expect(screen.getByRole('button', { name: 'Close dialog' })).toBeInTheDocument();

    rerender(
      <Modal defaultOpen>
        <ModalTrigger asChild>
          <button>Open</button>
        </ModalTrigger>
        <ModalContent>
          <ModalHeader showCloseButton={false}>
            <ModalTitle>Title</ModalTitle>
          </ModalHeader>
        </ModalContent>
      </Modal>,
    );
    expect(screen.queryByRole('button', { name: 'Close dialog' })).not.toBeInTheDocument();
  });

  // SC-07 (2026-09-29): the close button's accessible name was hard-coded.
  it('ModalHeader closeLabel overrides the close button accessible name (default unchanged)', () => {
    render(
      <Modal defaultOpen>
        <ModalContent>
          <ModalHeader closeLabel="閉じる">
            <ModalTitle>Title</ModalTitle>
          </ModalHeader>
        </ModalContent>
      </Modal>,
    );
    expect(screen.getByRole('button', { name: '閉じる' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Close dialog' })).not.toBeInTheDocument();
  });

  it('renders the portal into a custom container via the `container` prop', () => {
    const portalTarget = document.createElement('div');
    portalTarget.setAttribute('data-testid', 'custom-portal');
    document.body.appendChild(portalTarget);

    render(
      <Modal defaultOpen>
        <ModalTrigger asChild>
          <button>Open</button>
        </ModalTrigger>
        <ModalContent container={portalTarget}>
          <ModalTitle>Portal target title</ModalTitle>
        </ModalContent>
      </Modal>,
    );

    expect(portalTarget).toHaveTextContent('Portal target title');

    document.body.removeChild(portalTarget);
  });

  it('ModalClose dismisses the modal', async () => {
    render(
      <Modal defaultOpen>
        <ModalTrigger asChild>
          <button>Open</button>
        </ModalTrigger>
        <ModalContent>
          <ModalTitle>Title</ModalTitle>
          <ModalFooter>
            <ModalClose asChild>
              <button>Cancel</button>
            </ModalClose>
          </ModalFooter>
        </ModalContent>
      </Modal>,
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
