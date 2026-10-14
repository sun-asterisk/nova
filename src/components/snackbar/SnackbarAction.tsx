import { type ComponentProps, forwardRef } from 'react';
import { cn } from '@/utils';
import { snackbarActionStyles } from './Snackbar.styles';

/**
 * SnackbarAction component props extending standard HTML button attributes
 */
export type SnackbarActionProps = ComponentProps<'button'>;

/**
 * Action button component for Snackbar.
 * Used to provide interactive actions within snackbar notifications.
 *
 * @example
 * ```tsx
 * <SnackbarAction onClick={handleUndo}>
 *   元に戻す
 * </SnackbarAction>
 * ```
 */
export const SnackbarAction = forwardRef<HTMLButtonElement, SnackbarActionProps>(
  ({ className, children, ...rest }, ref) => {
    const actionClassName = cn(snackbarActionStyles(), className);

    return (
      <button ref={ref} type="button" className={actionClassName} {...rest}>
        {children}
      </button>
    );
  },
);

SnackbarAction.displayName = 'SnackbarAction';
