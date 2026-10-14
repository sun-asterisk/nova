import { forwardRef, type SVGProps } from 'react';

/** Chevron Up icon — 24x24, outline style, currentColor-based (Figma: Icon / Chevron Up) */
export const IconChevronUp = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>((props, ref) => (
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
      d="M11.3691 8.47462C11.7619 8.15427 12.3409 8.17686 12.707 8.54298L18.207 14.043C18.5976 14.4335 18.5976 15.0665 18.207 15.457C17.8165 15.8476 17.1835 15.8476 16.793 15.457L12 10.6641L7.20703 15.457C6.81651 15.8476 6.18349 15.8476 5.79297 15.457C5.40245 15.0665 5.40245 14.4335 5.79297 14.043L11.293 8.54298L11.3691 8.47462Z"
      fill="currentColor"
    />
  </svg>
));
IconChevronUp.displayName = 'IconChevronUp';
