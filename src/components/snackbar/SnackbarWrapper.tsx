import type { FC } from 'react';
import { Toaster } from 'sonner';

/**
 * Snackbar container component that manages the display of snackbars.
 * This component should be placed at the root level of your application.
 *
 * @example
 * ```tsx
 * // In your App.tsx or layout
 * function App() {
 *   return (
 *     <>
 *       <SnackbarContainer />
 *       <YourApp />
 *     </>
 *   );
 * }
 * ```
 */
export const SnackbarContainer: FC = () => {
  return (
    <Toaster
      // Figma Snackbar guideline: "原則として画面の右下に配置" (was top-right).
      position="bottom-right"
      expand={false}
      richColors={false}
      closeButton={false}
      toastOptions={{
        className: 'animate-in slide-in-from-bottom-2 fade-in duration-200',
      }}
    />
  );
};
