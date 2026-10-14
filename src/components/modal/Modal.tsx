'use client';
// Client boundary: creates React context at module scope (directly or via
// react-day-picker), which fails when imported from a React Server Component.
// See vite.config.ts useClientBanner.
import { cn } from '@/utils';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type ComponentRef,
  type Ref,
  type RefCallback,
} from 'react';
import { IconCross } from '../icons';
import { scrimStyles } from '../scrim/Scrim.styles';
import { Scrollbar } from '../scrollbar';
import { StatusIcon, type StatusIconValue } from '../statusIcon';
import { modalStyles } from './Modal.styles';

// ============================================================================
// Scroll-position-aware header/footer dividers
// ============================================================================

/**
 * Header/Body/Footer are separate sibling components, but Figma's scroll
 * divider behavior needs a single source of truth for "is the body
 * scrolled away from the top" / "...away from the bottom" — this context
 * (provided by `ModalContent`, updated by `ModalBody`, read by
 * `ModalHeader`/`ModalFooter`) is that shared state.
 */
interface ModalScrollDividerState {
  showHeaderDivider: boolean;
  showFooterDivider: boolean;
}

const NO_DIVIDERS: ModalScrollDividerState = {
  showHeaderDivider: false,
  showFooterDivider: false,
};

const ModalScrollDividerStateContext = createContext<ModalScrollDividerState>(NO_DIVIDERS);

// The `status` set on ModalContent, read by ModalHeader (renders the icon)
// and ModalBody/ModalFooter (indent to the title's left edge).
const ModalStatusContext = createContext<StatusIconValue | undefined>(undefined);
const ModalScrollDividerSetterContext = createContext<(state: ModalScrollDividerState) => void>(
  () => {},
);

// ============================================================================
// Types
// ============================================================================

/**
 * Available modal sizes — Figma Modal: Small 384px, Medium 560px (the
 * default), Large 768px, Auto (width follows the content). `auto` added and
 * the default changed from `small` to `medium` on 2026-10-07.
 */
export type ModalSize = 'small' | 'medium' | 'large' | 'auto';

export type ModalProps = ComponentPropsWithoutRef<typeof DialogPrimitive.Root>;
export type ModalTriggerProps = ComponentPropsWithoutRef<typeof DialogPrimitive.Trigger>;
export type ModalPortalProps = ComponentPropsWithoutRef<typeof DialogPrimitive.Portal>;
export type ModalOverlayProps = ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>;
export type ModalCloseProps = ComponentPropsWithoutRef<typeof DialogPrimitive.Close>;
export type ModalTitleProps = ComponentPropsWithoutRef<typeof DialogPrimitive.Title>;
export type ModalDescriptionProps = ComponentPropsWithoutRef<typeof DialogPrimitive.Description>;

export type ModalContentProps = ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
  /** Size of the modal @default 'medium' (Figma default; was 'small' before 2026-10-07) */
  size?: ModalSize;
  /**
   * Figma "+ Status Icon" style: a 24px status icon before the title, with
   * the body and footer indented to align with the title. Added 2026-10-07.
   */
  status?: StatusIconValue;
  /**
   * Redirects where this modal's portal mounts (e.g. into a scoped
   * ThemeProvider's wrapper element, a Shadow DOM host, or a specific
   * stacking-context container). Forwarded to Radix's own `Portal`
   * `container` prop; omit to use the default (`document.body`).
   * Mirrors the same escape hatch already on `DropdownMenuContent`/
   * `TooltipContent` (Phase 8) — Modal was the one portal-based component
   * missing it (Phase 13A finding).
   */
  container?: ComponentPropsWithoutRef<typeof DialogPrimitive.Portal>['container'];
};

export type ModalHeaderProps = ComponentPropsWithoutRef<'div'> & {
  /** Whether to show the close button in the top-right corner @default true */
  showCloseButton?: boolean;
  /**
   * Accessible name of the icon-only close button. Override it to match your
   * UI's language (e.g. `'閉じる'`).
   * @default 'Close dialog'
   */
  closeLabel?: string;
};
export type ModalBodyProps = ComponentPropsWithoutRef<'div'>;
export type ModalFooterProps = ComponentPropsWithoutRef<'div'>;

// ============================================================================
// Modal
// ============================================================================

/**
 * Modal root component. Manages the open/close state of the modal.
 * Must contain ModalTrigger and ModalContent as children.
 *
 * @example
 * ```tsx
 * <Modal>
 *   <ModalTrigger>Open Modal</ModalTrigger>
 *   <ModalContent>
 *     <ModalHeader>
 *       <ModalTitle>Title</ModalTitle>
 *     </ModalHeader>
 *     <ModalBody>
 *      <p>Modal content goes here</p>
 *    </ModalBody>
 *    <ModalFooter>
 *      <ModalClose asChild>
 *        <Button variant="secondary">Cancel</Button>
 *     </ModalClose>
 *    <Button variant="primary">Confirm</Button>
 *  </ModalFooter>
 *   </ModalContent>
 * </Modal>
 * ```
 *
 * @example
 * ```tsx
 * // Controlled mode
 * const [open, setOpen] = useState(false);
 * <Modal open={open} onOpenChange={setOpen}>
 *   <ModalTrigger>Controlled</ModalTrigger>
 *   <ModalContent>Content</ModalContent>
 * </Modal>
 * ```
 */
export const Modal = ({ ...props }: ModalProps) => {
  return <DialogPrimitive.Root data-slot="modal" {...props} />;
};

Modal.displayName = 'Modal';

// ============================================================================
// ModalTrigger
// ============================================================================

/**
 * Button that triggers the modal to open.
 * Typically wraps a Button component using asChild prop.
 *
 * @example
 * ```tsx
 * <ModalTrigger asChild>
 *   <Button>Open Modal</Button>
 * </ModalTrigger>
 * ```
 */
export const ModalTrigger = forwardRef<
  ComponentRef<typeof DialogPrimitive.Trigger>,
  ModalTriggerProps
>(({ ...props }, ref) => {
  return <DialogPrimitive.Trigger data-slot="modal-trigger" ref={ref} {...props} />;
});

ModalTrigger.displayName = 'ModalTrigger';

// ============================================================================
// ModalPortal
// ============================================================================

/**
 * Portal component that renders modal content in a different part of the DOM.
 * Usually not needed as it's used internally by ModalContent.
 *
 * **Do not wrap `ModalContent` in `ModalPortal`, or pair it with
 * `ModalOverlay`** — `ModalContent` always renders its own portal AND overlay,
 * so doing so yields a nested portal and TWO scrims (SC-06). `ModalPortal` +
 * `ModalOverlay` exist only for a fully custom content element built directly
 * on Radix's `Dialog.Content` (from `radix-ui`), bypassing `ModalContent`.
 * To redirect `ModalContent`'s portal, use its own `container` prop instead.
 *
 * @example
 * ```tsx
 * <ModalPortal>
 *   <ModalOverlay />
 *   <DialogPrimitive.Content>...</DialogPrimitive.Content>
 * </ModalPortal>
 * ```
 */
export const ModalPortal = ({ ...props }: ModalPortalProps) => {
  return <DialogPrimitive.Portal data-slot="modal-portal" {...props} />;
};

ModalPortal.displayName = 'ModalPortal';

// ============================================================================
// ModalClose
// ============================================================================

/**
 * Button that closes the modal.
 * Can be placed anywhere within the modal content.
 *
 * @example
 * ```tsx
 * <ModalClose asChild>
 *   <Button variant="secondary">Cancel</Button>
 * </ModalClose>
 * ```
 */
export const ModalClose = forwardRef<ComponentRef<typeof DialogPrimitive.Close>, ModalCloseProps>(
  ({ ...props }, ref) => {
    return <DialogPrimitive.Close data-slot="modal-close" ref={ref} {...props} />;
  },
);

ModalClose.displayName = 'ModalClose';

// ============================================================================
// ModalOverlay
// ============================================================================

/**
 * Semi-transparent overlay that appears behind the modal.
 * Automatically included in ModalContent — **never render it alongside
 * `ModalContent`** (that produces a second scrim). Only for a custom content
 * element built on Radix's `Dialog.Content`; see `ModalPortal`.
 *
 * @example
 * ```tsx
 * <ModalOverlay className="custom-overlay" />
 * ```
 */
export const ModalOverlay = forwardRef<
  ComponentRef<typeof DialogPrimitive.Overlay>,
  ModalOverlayProps
>(({ className, ...props }, ref) => {
  // The Figma "Scrim" component — same styles as the public `Scrim`
  // (fade in/out with the dialog; Radix sets `data-state`).
  return (
    <DialogPrimitive.Overlay
      data-slot="modal-overlay"
      ref={ref}
      className={cn(scrimStyles(), className)}
      {...props}
    />
  );
});

ModalOverlay.displayName = 'ModalOverlay';

// ============================================================================
// ModalContent
// ============================================================================

/**
 * Main container for modal content. Includes the overlay.
 * This is where you place your modal's header, body, and footer.
 * The X close button is rendered by `ModalHeader` (see its `showCloseButton` prop),
 * not by `ModalContent`.
 *
 * @example
 * ```tsx
 * <ModalContent>
 *   <ModalHeader>
 *     <ModalTitle>Modal Title</ModalTitle>
 *   </ModalHeader>
 *   <ModalBody>
 *     <p>Modal content goes here</p>
 *   </ModalBody>
 *   <ModalFooter>
 *     <Button>Confirm</Button>
 *   </ModalFooter>
 * </ModalContent>
 * ```
 *
 * @example
 * ```tsx
 * // Without close button (showCloseButton belongs on ModalHeader)
 * <ModalContent>
 *   <ModalHeader showCloseButton={false}>
 *     <ModalTitle>No close button</ModalTitle>
 *   </ModalHeader>
 * </ModalContent>
 * ```
 */
export const ModalContent = forwardRef<
  ComponentRef<typeof DialogPrimitive.Content>,
  ModalContentProps
>(({ className, size = 'medium', status, container, children, ...props }, ref) => {
  const styles = modalStyles({ size });
  const [scrollDividerState, setScrollDividerState] = useState(NO_DIVIDERS);

  return (
    <ModalPortal data-slot="modal-portal" container={container}>
      <ModalOverlay />
      <DialogPrimitive.Content
        data-slot="modal-content"
        ref={ref}
        className={cn(styles.content(), className)}
        {...props}
      >
        <ModalStatusContext.Provider value={status}>
          <ModalScrollDividerStateContext.Provider value={scrollDividerState}>
            <ModalScrollDividerSetterContext.Provider value={setScrollDividerState}>
              {children}
            </ModalScrollDividerSetterContext.Provider>
          </ModalScrollDividerStateContext.Provider>
        </ModalStatusContext.Provider>
      </DialogPrimitive.Content>
    </ModalPortal>
  );
});

ModalContent.displayName = 'ModalContent';

// ============================================================================
// ModalHeader
// ============================================================================

/**
 * Header section of the modal. Contains the title and optional description.
 * Use flex layout with custom icons as needed.
 *
 * @param showCloseButton - Whether to show the X close button in the top-right corner (default: true)
 * @param closeLabel - Accessible name of that close button (default: 'Close dialog')
 *
 * @example
 * ```tsx
 * <ModalHeader>
 *   <ModalTitle>Modal Title</ModalTitle>
 *   <ModalDescription>Description text</ModalDescription>
 * </ModalHeader>
 * ```
 *
 * @example
 * ```tsx
 * // With custom icon (slot pattern)
 * <ModalHeader>
 *   <div className="flex items-start gap-3">
 *     <MdWarning className="w-6 h-6 text-sds-icon-warning shrink-0 mt-0.5" />
 *     <div className="flex-1">
 *       <ModalTitle>Warning</ModalTitle>
 *       <ModalDescription>Please review</ModalDescription>
 *     </div>
 *   </div>
 * </ModalHeader>
 * ```
 */
export const ModalHeader = forwardRef<HTMLDivElement, ModalHeaderProps>(
  ({ className, children, showCloseButton = true, closeLabel = 'Close dialog', ...props }, ref) => {
    const { showHeaderDivider } = useContext(ModalScrollDividerStateContext);
    const status = useContext(ModalStatusContext);
    const styles = modalStyles({ headerDivider: showHeaderDivider });
    return (
      <div data-slot="modal-header" ref={ref} className={cn(styles.header(), className)} {...props}>
        {status ? (
          <div className={styles.headerLead()}>
            <StatusIcon status={status} />
            {children}
          </div>
        ) : (
          children
        )}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="modal-close"
            aria-label={closeLabel}
            className={styles.closeButton()}
          >
            <IconCross />
          </DialogPrimitive.Close>
        )}
      </div>
    );
  },
);

ModalHeader.displayName = 'ModalHeader';

// ============================================================================
// ModalTitle
// ============================================================================

/**
 * Title text for the modal. Should be placed inside ModalHeader.
 * Automatically linked for accessibility.
 *
 * @example
 * ```tsx
 * <ModalTitle>新規作成</ModalTitle>
 * ```
 */
export const ModalTitle = forwardRef<ComponentRef<typeof DialogPrimitive.Title>, ModalTitleProps>(
  ({ className, ...props }, ref) => {
    const styles = modalStyles();
    return (
      <DialogPrimitive.Title
        data-slot="modal-title"
        ref={ref}
        className={cn(styles.title(), className)}
        {...props}
      />
    );
  },
);

ModalTitle.displayName = 'ModalTitle';

// ============================================================================
// ModalDescription
// ============================================================================

/**
 * Description text for the modal. Should be placed inside ModalHeader,
 * typically after ModalTitle. Automatically linked to the dialog's
 * `aria-describedby` for accessibility.
 *
 * @example
 * ```tsx
 * <ModalHeader>
 *   <ModalTitle>Delete item</ModalTitle>
 *   <ModalDescription>This action cannot be undone.</ModalDescription>
 * </ModalHeader>
 * ```
 */
export const ModalDescription = forwardRef<
  ComponentRef<typeof DialogPrimitive.Description>,
  ModalDescriptionProps
>(({ className, ...props }, ref) => {
  const styles = modalStyles();
  return (
    <DialogPrimitive.Description
      data-slot="modal-description"
      ref={ref}
      className={cn(styles.description(), className)}
      {...props}
    />
  );
});

ModalDescription.displayName = 'ModalDescription';

// ============================================================================
// ModalBody
// ============================================================================

/**
 * Main content area of the modal. Place your form fields, text, or other content here.
 *
 * @example
 * ```tsx
 * <ModalBody>
 *   <TextField label="名前" placeholder="名前を入力" />
 *   <TextField label="メール" placeholder="メールを入力" />
 * </ModalBody>
 * ```
 */
// Small local ref-merge helper — `ModalBody` needs its own internal ref (to
// track scroll position) alongside any ref a consumer forwards in.
function mergeRefs<T>(...refs: Array<Ref<T> | undefined>): RefCallback<T> {
  return (node) => {
    for (const ref of refs) {
      if (typeof ref === 'function') ref(node);
      else if (ref) (ref as { current: T | null }).current = node;
    }
  };
}

// 1px tolerance for sub-pixel/rounding differences between scrollHeight,
// clientHeight, and scrollTop across browsers.
const SCROLL_DIVIDER_THRESHOLD = 1;

export const ModalBody = forwardRef<HTMLDivElement, ModalBodyProps>(
  ({ className, children, dir, ...props }, ref) => {
    const status = useContext(ModalStatusContext);
    const styles = modalStyles({ indented: Boolean(status) });
    const setScrollDividerState = useContext(ModalScrollDividerSetterContext);
    const bodyRef = useRef<HTMLDivElement>(null);

    // Figma: a divider appears below the header while content is hidden
    // above (scrolled away from the top) and above the footer while
    // content is hidden below (scrolled away from the bottom) — see the
    // fuller explanation on the `headerDivider`/`footerDivider` variants in
    // Modal.styles.ts. Re-measured on scroll, on resize (the body's own
    // size, e.g. a window resize), and whenever `children` changes (e.g.
    // async content loading in) since content growing/shrinking can change
    // whether it overflows at all without the user scrolling.
    useLayoutEffect(() => {
      // The scrolling element is the Sun Scrollbar's viewport (Figma's Modal
      // body has a Scrollbar Rail, 2026-10-07), not the body root.
      const el = bodyRef.current?.querySelector<HTMLElement>('[data-slot="scroll-area-viewport"]');
      if (!el) return;

      const update = () => {
        const canScroll = el.scrollHeight - el.clientHeight > SCROLL_DIVIDER_THRESHOLD;
        const atTop = el.scrollTop <= SCROLL_DIVIDER_THRESHOLD;
        const atBottom =
          el.scrollTop + el.clientHeight >= el.scrollHeight - SCROLL_DIVIDER_THRESHOLD;
        setScrollDividerState({
          showHeaderDivider: canScroll && !atTop,
          showFooterDivider: canScroll && !atBottom,
        });
      };

      update();
      el.addEventListener('scroll', update);
      const resizeObserver = new ResizeObserver(update);
      resizeObserver.observe(el);

      return () => {
        el.removeEventListener('scroll', update);
        resizeObserver.disconnect();
      };
      // Re-measures whenever the rendered content changes (`children`), not
      // just on scroll/resize — content growing/shrinking can change
      // whether it overflows at all without the user ever scrolling.
    }, [children]);

    // Reset to "no dividers" on unmount so a later-mounted Modal (or a
    // footer-less one) doesn't inherit a stale state from a previous open.
    useEffect(() => {
      return () => setScrollDividerState(NO_DIVIDERS);
    }, [setScrollDividerState]);

    return (
      <Scrollbar
        data-slot="modal-body"
        ref={mergeRefs(ref, bodyRef)}
        className={cn(styles.body(), className)}
        viewportClassName={styles.bodyViewport()}
        showHorizontal={false}
        // A div's `dir` is a free string; ScrollArea accepts only ltr/rtl.
        dir={dir === 'rtl' || dir === 'ltr' ? dir : undefined}
        {...props}
      >
        <div className={styles.bodyContent()}>{children}</div>
      </Scrollbar>
    );
  },
);

ModalBody.displayName = 'ModalBody';

// ============================================================================
// ModalFooter
// ============================================================================

/**
 * Footer section of the modal, typically contains action buttons.
 * Buttons are right-aligned on desktop, stacked on mobile.
 *
 * @example
 * ```tsx
 * <ModalFooter>
 *   <Button variant="secondary" onClick={onCancel}>キャンセル</Button>
 *   <Button variant="primary" onClick={onConfirm}>確認</Button>
 * </ModalFooter>
 * ```
 */
export const ModalFooter = forwardRef<HTMLDivElement, ModalFooterProps>(
  ({ className, ...props }, ref) => {
    const { showFooterDivider } = useContext(ModalScrollDividerStateContext);
    const status = useContext(ModalStatusContext);
    const styles = modalStyles({ footerDivider: showFooterDivider, indented: Boolean(status) });
    return (
      <div
        data-slot="modal-footer"
        ref={ref}
        className={cn(styles.footer(), className)}
        {...props}
      />
    );
  },
);

ModalFooter.displayName = 'ModalFooter';
