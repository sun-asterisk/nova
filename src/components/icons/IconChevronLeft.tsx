import { forwardRef, type SVGProps } from 'react';

/** Chevron Left icon — 24x24, outline style, currentColor-based (Figma: Icon / Chevron Left) */
export const IconChevronLeft = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>((props, ref) => (
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
      d="M14.043 5.79295C14.4335 5.40243 15.0665 5.40243 15.457 5.79295C15.8475 6.18348 15.8475 6.81649 15.457 7.20702L10.664 12L15.457 16.793C15.8475 17.1835 15.8475 17.8165 15.457 18.207C15.0665 18.5975 14.4335 18.5975 14.043 18.207L8.54295 12.707C8.15243 12.3165 8.15243 11.6835 8.54295 11.293L14.043 5.79295Z"
      fill="currentColor"
    />
  </svg>
));
IconChevronLeft.displayName = 'IconChevronLeft';
