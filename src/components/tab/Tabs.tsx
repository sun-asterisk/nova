'use client';
// Client boundary: Tabs keeps a root ref and wraps onValueChange (auto-scroll
// of the selected tab, 2026-10-07), so it uses hooks and passes a function to
// Radix — both fail when rendered from a React Server Component without this
// directive (caught by test/consumers rsc-probe `tab-render`). See
// vite.config.ts useClientBanner.
import {
  forwardRef,
  useCallback,
  useRef,
  type ComponentProps,
  type ReactNode,
  type Ref,
  type RefCallback,
} from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { tabsStyles } from './Tabs.styles';
import { cn } from '@/utils';

/**
 * Tabs component props extending Radix UI Tabs Root
 */
export type TabsProps = ComponentProps<typeof TabsPrimitive.Root> & {
  /** The value of the tab that should be active by default (uncontrolled usage). Omit when fully controlled via `value`/`onValueChange`. */
  defaultValue?: string;
  /** Callback fired when the active tab changes */
  onValueChange?: (value: string) => void;
  /** Additional CSS classes to apply to the root element */
  className?: string;
  /** Tab list and content elements */
  children: ReactNode;
};

/**
 * A flexible tabs component for organizing content into separate views.
 * Built on Radix UI Tabs primitives with support for icons, badges, and disabled states.
 *
 * Follows design system guidelines:
 * - Tab height: 40px
 * - Active tab: bold text with 2px bottom border
 * - Hover: subtle background color
 * - Disabled: reduced opacity with disabled cursor
 *
 * `badgeLabel`/`icon` are not props of `TabsTrigger` — compose them as
 * children instead (see the `Tabs.stories.tsx` `WithBadges`/`WithIcons`
 * stories for the actual working pattern):
 * ```tsx
 * <TabsTrigger value="tab2">Tab 2 <Badge label="5" /></TabsTrigger>
 * ```
 *
 * @example
 * ```tsx
 * <Tabs defaultValue="tab1" onValueChange={(value) => console.log(value)}>
 *   <TabsList>
 *     <TabsTrigger value="tab1">Tab 1</TabsTrigger>
 *     <TabsTrigger value="tab2">Tab 2</TabsTrigger>
 *   </TabsList>
 *   <TabsContent value="tab1">Content for tab 1</TabsContent>
 *   <TabsContent value="tab2">Content for tab 2</TabsContent>
 * </Tabs>
 * ```
 */
// Small local ref-merge helper (same pattern as Modal.tsx/ThemeProvider.tsx/
// DatePickerDayButton.tsx) — Tabs needs its own root ref for the auto-scroll
// below, alongside any ref a consumer forwards in.
function mergeRefs<T>(...refs: Array<Ref<T> | undefined>): RefCallback<T> {
  return (node) => {
    for (const ref of refs) {
      if (typeof ref === 'function') ref(node);
      else if (ref) (ref as { current: T | null }).current = node;
    }
  };
}

/**
 * Figma Tab guideline (frame 2006:1663): when a selected tab is cut off by the
 * horizontally scrolling list, scroll it fully into view — an edge tab keeps a
 * 16px margin (the list's `scroll-px-sds-200` scroll-padding) — and leave the
 * list where it is when the tab is already fully visible (`nearest`).
 * Only this root's own active trigger: a nested Tabs inside a panel has its
 * own root and is skipped.
 */
function scrollActiveTabIntoView(root: HTMLElement | null) {
  if (!root) return;
  const active = Array.from(
    root.querySelectorAll<HTMLElement>('[role="tab"][data-state="active"]'),
  ).find((tab) => tab.closest('[data-slot="tabs"]') === root);
  active?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
}

export const Tabs = forwardRef<HTMLDivElement, TabsProps>(
  ({ className, children, onValueChange, ...props }, ref) => {
    const styles = tabsStyles();
    const rootRef = useRef<HTMLDivElement | null>(null);

    // Runs on every user selection (click, or arrow/Home/End with Radix's
    // automatic activation). The new active trigger is committed after this
    // callback, so the scroll waits one frame.
    const handleValueChange = useCallback(
      (value: string) => {
        onValueChange?.(value);
        requestAnimationFrame(() => scrollActiveTabIntoView(rootRef.current));
      },
      [onValueChange],
    );

    return (
      <TabsPrimitive.Root
        ref={mergeRefs(ref, rootRef)}
        data-slot="tabs"
        className={cn(styles.root(), className)}
        onValueChange={handleValueChange}
        {...props}
      >
        {children}
      </TabsPrimitive.Root>
    );
  },
);

Tabs.displayName = 'Tabs';

// ============================================================================
// Tabs List Component
// ============================================================================

/**
 * TabsList component props extending Radix UI Tabs List
 */
export type TabsListProps = ComponentProps<typeof TabsPrimitive.List> & {
  /** Additional CSS classes to apply to the list element */
  className?: string;
  /** Tab trigger elements */
  children: ReactNode;
};

/**
 * Container for tab triggers. Displays tabs in a horizontal row with bottom margin.
 * Should be placed as a direct child of Tabs component.
 *
 * @example
 * ```tsx
 * <TabsList>
 *   <TabsTrigger value="tab1">Tab 1</TabsTrigger>
 *   <TabsTrigger value="tab2">Tab 2</TabsTrigger>
 * </TabsList>
 * ```
 */
export const TabsList = forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, children, ...props }, ref) => {
    const styles = tabsStyles();

    return (
      <TabsPrimitive.List ref={ref} className={cn(styles.list(), className)} {...props}>
        {children}
      </TabsPrimitive.List>
    );
  },
);

TabsList.displayName = 'TabsList';

// ============================================================================
// Tabs Trigger Component
// ============================================================================

/**
 * TabsTrigger component props extending Radix UI Tabs Trigger
 */
export type TabsTriggerProps = ComponentProps<typeof TabsPrimitive.Trigger> & {
  /** Additional CSS classes to apply to the trigger element */
  className?: string;
  /** Tab label text */
  children: ReactNode;
};

/**
 * Individual tab button that triggers content display when clicked.
 * Supports icons, badges, and disabled states.
 *
 * Visual states:
 * - Default: Light text with thin bottom border
 * - Hover: Subtle background color
 * - Active: Bold text with thick bottom border (2px)
 * - Disabled: Reduced opacity, no interaction
 *
 * @example
 * ```tsx
 * // Basic tab
 * <TabsTrigger value="overview">Overview</TabsTrigger>
 *
 * // Tab with badge — badgeLabel/icon are NOT props, compose as children:
 * <TabsTrigger value="notifications">
 *   Notifications <Badge label="12" />
 * </TabsTrigger>
 *
 * // Tab with icon
 * <TabsTrigger value="settings">
 *   <SettingsIcon /> Settings
 * </TabsTrigger>
 *
 * // Disabled tab
 * <TabsTrigger value="locked" disabled>
 *   Locked Feature
 * </TabsTrigger>
 * ```
 */
export const TabsTrigger = forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, children, disabled, ...props }, ref) => {
    const styles = tabsStyles();
    const triggerContent = <div className={cn(styles.triggerContent())}>{children}</div>;

    return (
      <TabsPrimitive.Trigger
        ref={ref}
        className={cn(styles.trigger(), className)}
        disabled={disabled}
        {...props}
      >
        {triggerContent}
        <div className={styles.focusRing()} aria-hidden="true" />
      </TabsPrimitive.Trigger>
    );
  },
);

TabsTrigger.displayName = 'TabsTrigger';

// ============================================================================
// Tabs Content Component
// ============================================================================

/**
 * TabsContent component props extending Radix UI Tabs Content
 */
export type TabsContentProps = ComponentProps<typeof TabsPrimitive.Content> & {
  /** Additional CSS classes to apply to the content element */
  className?: string;
  /** Content to display when this tab is active */
  children: ReactNode;
};

/**
 * Content container for each tab. Only the content matching the active tab value is displayed.
 * Includes default padding that can be overridden with className.
 *
 * @example
 * ```tsx
 * <TabsContent value="tab1">
 *   <h3>Tab 1 Content</h3>
 *   <p>This content is only visible when tab1 is active.</p>
 * </TabsContent>
 * ```
 */
export const TabsContent = forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, children, ...props }, ref) => {
    const styles = tabsStyles();

    return (
      <TabsPrimitive.Content ref={ref} className={cn(styles.content(), className)} {...props}>
        {children}
      </TabsPrimitive.Content>
    );
  },
);

TabsContent.displayName = 'TabsContent';
