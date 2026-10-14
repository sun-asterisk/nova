export type StatusIconValue = 'info' | 'success' | 'caution' | 'danger' | 'loading';

/**
 * Per-status text-color class, applied to the underlying `currentColor`-based
 * icon. `loading` has no entry — it renders `Spinner`, which manages its own
 * color via its own `inverse` prop.
 */
export const statusIconColorClass: Record<
  Exclude<StatusIconValue, 'loading'>,
  { default: string; inverse: string }
> = {
  info: { default: 'text-sds-icon-info', inverse: 'text-sds-icon-info-inverse' },
  success: { default: 'text-sds-icon-success', inverse: 'text-sds-icon-success-inverse' },
  caution: { default: 'text-sds-icon-caution', inverse: 'text-sds-icon-caution-inverse' },
  danger: { default: 'text-sds-icon-danger', inverse: 'text-sds-icon-danger-inverse' },
};
