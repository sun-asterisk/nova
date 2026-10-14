import { forwardRef, type SVGProps } from 'react';

/** Chevron Down icon — 24x24, outline style, currentColor-based (Figma: Icon / Chevron Down) */
export const IconChevronDown = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>((props, ref) => (
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
      d="M16.793 8.54295C17.1835 8.15243 17.8165 8.15243 18.207 8.54295C18.5975 8.93348 18.5975 9.56649 18.207 9.95702L12.707 15.457C12.3165 15.8475 11.6835 15.8475 11.293 15.457L5.79295 9.95702C5.40243 9.56649 5.40243 8.93348 5.79295 8.54295C6.18348 8.15243 6.81649 8.15243 7.20702 8.54295L12 13.3359L16.793 8.54295Z"
      fill="currentColor"
    />
  </svg>
));
IconChevronDown.displayName = 'IconChevronDown';
