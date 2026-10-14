import { forwardRef, type SVGProps } from 'react';

/** Chevron Right icon — 24x24, outline style, currentColor-based (Figma: Icon / Chevron Right) */
export const IconChevronRight = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>((props, ref) => (
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
      d="M8.54295 5.79295C8.93348 5.40243 9.56649 5.40243 9.95702 5.79295L15.457 11.293C15.8475 11.6835 15.8475 12.3165 15.457 12.707L9.95702 18.207C9.56649 18.5975 8.93348 18.5975 8.54295 18.207C8.15243 17.8165 8.15243 17.1835 8.54295 16.793L13.3359 12L8.54295 7.20702C8.15243 6.81649 8.15243 6.18348 8.54295 5.79295Z"
      fill="currentColor"
    />
  </svg>
));
IconChevronRight.displayName = 'IconChevronRight';
