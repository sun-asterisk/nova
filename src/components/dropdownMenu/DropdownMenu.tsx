import { cn } from '@/utils';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { type ComponentProps, forwardRef, type ReactNode } from 'react';
import { IconCheck, IconChevronRight } from '../icons';
import { dropdownMenuStyles } from './DropdownMenu.styles';

const styles = dropdownMenuStyles();

const DropdownMenu = DropdownMenuPrimitive.Root;
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
const DropdownMenuGroup = DropdownMenuPrimitive.Group;
const DropdownMenuSub = DropdownMenuPrimitive.Sub;
const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

/**
 * Additional props for redirecting where a portaled part of the menu mounts
 * (e.g. into a Shadow DOM host or a specific stacking-context container).
 * Forwarded to Radix's own `Portal` `container` prop; omit to use the
 * default (`document.body`).
 */
type PortalContainerProps = {
  container?: ComponentProps<typeof DropdownMenuPrimitive.Portal>['container'];
};

const DropdownMenuContent = forwardRef<
  HTMLDivElement,
  ComponentProps<typeof DropdownMenuPrimitive.Content> & PortalContainerProps
>(({ className, sideOffset = 4, collisionPadding = 16, container, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal container={container}>
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      // 16px default: Figma's own guideline text ("画面の上下端から16pxの余白を
      // 確保できる高さを上限とし") — the menu must keep a 16px margin from the
      // viewport edges, auto-shrinking (via `content`'s `max-h-[var(--radix-
      // dropdown-menu-content-available-height)]`) when space is tight.
      collisionPadding={collisionPadding}
      className={cn(styles.content(), className)}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
));
DropdownMenuContent.displayName = 'DropdownMenuContent';

/**
 * `description` renders a secondary line below `children` (Figma's "Menu
 * Item" `supportText` property — 12px, `text-secondary`, truncated to one
 * line with an ellipsis). When provided, `children` is treated as the label
 * only — don't also nest a leading icon or a `DropdownMenuShortcut` inside
 * `children` in this case, since both would be pulled into the stacked
 * label+description column instead of staying as row-level siblings; render
 * an icon as a sibling before `children`, and combine with a shortcut by
 * placing `DropdownMenuShortcut` as a sibling after the item instead.
 */
const DropdownMenuItem = forwardRef<
  HTMLDivElement,
  ComponentProps<typeof DropdownMenuPrimitive.Item> & {
    destructive?: boolean;
    description?: ReactNode;
  }
>(({ className, destructive = false, description, children, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(destructive ? styles.itemDestructive() : styles.item(), className)}
    {...props}
  >
    {description ? (
      <span className={styles.itemText()}>
        {children}
        <span className={styles.itemDescription()}>{description}</span>
      </span>
    ) : (
      children
    )}
  </DropdownMenuPrimitive.Item>
));
DropdownMenuItem.displayName = 'DropdownMenuItem';

/**
 * Figma Dropdown Menu guideline (表示と制御): clicking a selection item
 * (checkbox / radio) only toggles its value and does NOT close the menu, so
 * several options can be changed in a row. Radix closes on select by default,
 * so the selection items cancel that after the consumer's own `onSelect`.
 * To close anyway, control `open` on `DropdownMenu` and set it to `false`
 * from `onSelect` (2026-10-07; previously the menu closed).
 */
const keepOpenOnSelect =
  (onSelect?: (event: Event) => void) =>
  (event: Event): void => {
    onSelect?.(event);
    event.preventDefault();
  };

/**
 * A menu item with a checkbox indicator, for multi-select options within a
 * DropdownMenu (e.g. a "toggle column visibility" menu). `description` adds
 * a secondary line below the label — see `DropdownMenuItem`'s doc for the
 * same constraint (don't combine it with a nested shortcut/icon in `children`).
 *
 * @example
 * ```tsx
 * <DropdownMenuCheckboxItem checked={showEmail} onCheckedChange={setShowEmail}>
 *   Email
 * </DropdownMenuCheckboxItem>
 * ```
 */
const DropdownMenuCheckboxItem = forwardRef<
  HTMLDivElement,
  ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem> & { description?: ReactNode }
>(({ className, description, children, onSelect, ...props }, ref) => (
  <DropdownMenuPrimitive.CheckboxItem
    ref={ref}
    className={cn(styles.checkboxItem(), className)}
    onSelect={keepOpenOnSelect(onSelect)}
    {...props}
  >
    <span className={styles.itemIndicator()}>
      <DropdownMenuPrimitive.ItemIndicator>
        <IconCheck width={20} height={20} />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {description ? (
      <span className={styles.itemText()}>
        {children}
        <span className={styles.itemDescription()}>{description}</span>
      </span>
    ) : (
      children
    )}
  </DropdownMenuPrimitive.CheckboxItem>
));
DropdownMenuCheckboxItem.displayName = 'DropdownMenuCheckboxItem';

/**
 * A menu item with a selection indicator. Must be used inside a
 * `DropdownMenuRadioGroup`.
 *
 * Uses the same `IconCheck` indicator as `DropdownMenuCheckboxItem` (not a
 * radio dot) — confirmed via Figma's "Menu Item" component (node
 * `11853:12967`): its "Option" style has a single check-icon indicator for
 * the selected state regardless of single- vs multi-select semantics; there
 * is no distinct radio-dot variant in the design system. A previous version
 * used an unrelated `react-icons/md` `MdCircle` dot, which matched neither
 * Figma nor this library's own icon set.
 *
 * @example
 * ```tsx
 * <DropdownMenuRadioGroup value={sortBy} onValueChange={setSortBy}>
 *   <DropdownMenuRadioItem value="name">Name</DropdownMenuRadioItem>
 *   <DropdownMenuRadioItem value="date">Date</DropdownMenuRadioItem>
 * </DropdownMenuRadioGroup>
 * ```
 */
const DropdownMenuRadioItem = forwardRef<
  HTMLDivElement,
  ComponentProps<typeof DropdownMenuPrimitive.RadioItem> & { description?: ReactNode }
>(({ className, description, children, onSelect, ...props }, ref) => (
  <DropdownMenuPrimitive.RadioItem
    ref={ref}
    className={cn(styles.radioItem(), className)}
    onSelect={keepOpenOnSelect(onSelect)}
    {...props}
  >
    <span className={styles.itemIndicator()}>
      <DropdownMenuPrimitive.ItemIndicator>
        <IconCheck width={20} height={20} />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {description ? (
      <span className={styles.itemText()}>
        {children}
        <span className={styles.itemDescription()}>{description}</span>
      </span>
    ) : (
      children
    )}
  </DropdownMenuPrimitive.RadioItem>
));
DropdownMenuRadioItem.displayName = 'DropdownMenuRadioItem';

/**
 * The trigger for a nested submenu. Must be a child of `DropdownMenuSub`,
 * paired with a sibling `DropdownMenuSubContent`.
 *
 * @example
 * ```tsx
 * <DropdownMenuSub>
 *   <DropdownMenuSubTrigger>Export</DropdownMenuSubTrigger>
 *   <DropdownMenuSubContent>
 *     <DropdownMenuItem>CSV</DropdownMenuItem>
 *     <DropdownMenuItem>JSON</DropdownMenuItem>
 *   </DropdownMenuSubContent>
 * </DropdownMenuSub>
 * ```
 */
const DropdownMenuSubTrigger = forwardRef<
  HTMLDivElement,
  ComponentProps<typeof DropdownMenuPrimitive.SubTrigger>
>(({ className, children, ...props }, ref) => (
  <DropdownMenuPrimitive.SubTrigger
    ref={ref}
    className={cn(styles.subTrigger(), className)}
    {...props}
  >
    {children}
    <IconChevronRight width={20} height={20} className="ml-auto" aria-hidden />
  </DropdownMenuPrimitive.SubTrigger>
));
DropdownMenuSubTrigger.displayName = 'DropdownMenuSubTrigger';

/** The content panel of a nested submenu. See `DropdownMenuSubTrigger`. */
const DropdownMenuSubContent = forwardRef<
  HTMLDivElement,
  ComponentProps<typeof DropdownMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.SubContent
    ref={ref}
    className={cn(styles.subContent(), className)}
    {...props}
  />
));
DropdownMenuSubContent.displayName = 'DropdownMenuSubContent';

const DropdownMenuSeparator = forwardRef<
  HTMLDivElement,
  ComponentProps<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={cn(styles.separator(), className)}
    {...props}
  />
));
DropdownMenuSeparator.displayName = 'DropdownMenuSeparator';

/**
 * A non-interactive section heading, typically paired with a preceding
 * `DropdownMenuSeparator` to label a group of items.
 *
 * Figma models this pairing as a single bundled "Group Header" component
 * (node `11846:2269`) with two independent boolean properties (`divider`,
 * `groupLabel`) — deliberately NOT mirrored 1:1 here. `DropdownMenuLabel`
 * and `DropdownMenuSeparator` stay separate, composable primitives (this
 * library's established convention — see `MenuItem`'s `prefixIcon`/
 * `suffixIcon`/`shortcutKey` for the same non-1:1 choice), which already
 * covers all of Figma's combinations through plain composition: divider
 * alone, label alone, or both together in either order.
 *
 * @example
 * ```tsx
 * <DropdownMenuSeparator />
 * <DropdownMenuLabel>My account</DropdownMenuLabel>
 * ```
 */
const DropdownMenuLabel = forwardRef<
  HTMLDivElement,
  ComponentProps<typeof DropdownMenuPrimitive.Label>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Label ref={ref} className={cn(styles.label(), className)} {...props} />
));
DropdownMenuLabel.displayName = 'DropdownMenuLabel';

const DropdownMenuShortcut = ({ className, ...props }: ComponentProps<'span'>) => (
  <span className={cn(styles.shortcut(), className)} {...props} />
);
DropdownMenuShortcut.displayName = 'DropdownMenuShortcut';

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuRadioGroup,
};
