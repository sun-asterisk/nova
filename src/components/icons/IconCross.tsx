import { forwardRef, type SVGProps } from 'react';

/** Cross icon — 24x24, outline style, currentColor-based (Figma: Icon / Cross) */
export const IconCross = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>((props, ref) => (
  <svg
    ref={ref}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    {...props}
  >
    <path
      d="M17.6969 4.74766C18.1265 4.31808 18.823 4.31808 19.2525 4.74766C19.682 5.17721 19.682 5.87279 19.2525 6.30235L13.5543 11.9996L19.2525 17.6969C19.6821 18.1265 19.6821 18.823 19.2525 19.2525C18.823 19.6821 18.1265 19.6821 17.6969 19.2525L11.9996 13.5543L6.30235 19.2525C5.87279 19.682 5.17721 19.682 4.74766 19.2525C4.31808 18.823 4.31808 18.1265 4.74766 17.6969L10.4439 11.9996L4.74766 6.30235C4.31808 5.87277 4.31808 5.17724 4.74766 4.74766C5.17724 4.31808 5.87277 4.31808 6.30235 4.74766L11.9996 10.4439L17.6969 4.74766Z"
      fill="currentColor"
    />
  </svg>
));
IconCross.displayName = 'IconCross';
