/**
 * Public API contract fixtures for `Modal` — type-only checks (never
 * executed at runtime), run via `pnpm test:api`. See
 * docs/architecture/component-api-conventions.md §15 for the full
 * rationale and the one-file-per-component convention this file follows.
 */
import { expectTypeOf } from 'vitest';
import type { ComponentRef } from 'react';
import { Button } from '@/components/button';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  ModalTrigger,
  type ModalContentProps,
  type ModalDescriptionProps,
  type ModalHeaderProps,
} from '@/components/modal';

expectTypeOf<ModalDescriptionProps>().toHaveProperty('children');
expectTypeOf<ModalContentProps['size']>().toEqualTypeOf<
  'small' | 'medium' | 'large' | 'auto' | undefined
>();
// Figma "+ Status Icon" style (2026-10-07): the shared StatusIcon statuses.
expectTypeOf<ModalContentProps['status']>().toEqualTypeOf<
  'info' | 'success' | 'caution' | 'danger' | 'loading' | undefined
>();
expectTypeOf<ModalContentProps['container']>().not.toBeNever();
expectTypeOf<ModalHeaderProps['showCloseButton']>().toEqualTypeOf<boolean | undefined>();
// SC-07 (2026-09-29): overridable close-button accessible name.
expectTypeOf<ModalHeaderProps['closeLabel']>().toEqualTypeOf<string | undefined>();

() => (
  <Modal>
    <ModalTrigger asChild>
      <Button>Open</Button>
    </ModalTrigger>
    <ModalContent size="large" container={document.body}>
      <ModalHeader showCloseButton={false}>
        <ModalTitle>Title</ModalTitle>
        <ModalDescription>Description</ModalDescription>
      </ModalHeader>
      <ModalBody>Body content</ModalBody>
      <ModalFooter>
        <Button>Confirm</Button>
      </ModalFooter>
    </ModalContent>
  </Modal>
);

expectTypeOf<ComponentRef<typeof ModalContent>>().toEqualTypeOf<HTMLDivElement>();
expectTypeOf<ComponentRef<typeof ModalTrigger>>().toEqualTypeOf<HTMLButtonElement>();

// Every size (4 members, `auto` added 2026-10-07) and a status.
() => <ModalContent size="auto" status="danger" />;
// Invalid: not a real ModalSize.
// () => <ModalContent size="xl" />;
