import { Popover as PopoverPrimitive } from 'radix-ui';

import { cn } from '@/utils';
import { forwardRef, type ComponentProps, type ComponentRef } from 'react';

export const DatePickerPopover = ({ ...props }: ComponentProps<typeof PopoverPrimitive.Root>) => {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />;
};

export const DatePickerPopoverTrigger = forwardRef<
  ComponentRef<typeof PopoverPrimitive.Trigger>,
  ComponentProps<typeof PopoverPrimitive.Trigger>
>((props, ref) => {
  return <PopoverPrimitive.Trigger ref={ref} data-slot="popover-trigger" {...props} />;
});
DatePickerPopoverTrigger.displayName = 'DatePickerPopoverTrigger';

type PortalContainerProps = {
  /** Redirect where the popover's portal mounts (default: `document.body`). Forwarded to Radix's `Portal` `container` prop. */
  container?: ComponentProps<typeof PopoverPrimitive.Portal>['container'];
};

export const DatePickerPopoverContent = forwardRef<
  ComponentRef<typeof PopoverPrimitive.Content>,
  ComponentProps<typeof PopoverPrimitive.Content> & PortalContainerProps
>(({ className, align = 'start', sideOffset = 4, container, ...props }, ref) => {
  // Figma Date Picker デザイン仕様: the panel floats 4px under the field,
  // left-aligned (配置とレイアウト: Bottom + 左端揃え; Radix flips to Top and
  // shifts to the right edge when space runs out — avoidCollisions default).
  // Surface/Base, radius 16, Elevation Lv.2, no border.
  // design-foundation.md §4's DatePicker shadow row was corrected from
  // level-5 to level-2 from this Figma spec (2026-10-07).
  return (
    <PopoverPrimitive.Portal container={container}>
      <PopoverPrimitive.Content
        ref={ref}
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          'bg-sds-surface-base text-sds-text-primary data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 origin-(--radix-popover-content-transform-origin) rounded-sds-400 shadow-sds-level-2 overflow-hidden outline-hidden',
          className,
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
});
DatePickerPopoverContent.displayName = 'DatePickerPopoverContent';
