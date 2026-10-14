import { forwardRef, type SVGProps } from 'react';

/** Clock icon — 24x24, outline style, currentColor-based (Figma: Icon / Clock) */
export const IconClock = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>((props, ref) => (
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
    <g>
      <path
        d="M20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12ZM22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
        fill="currentColor"
      />
      <path
        d="M11 7C11 6.44772 11.4477 6 12 6C12.5523 6 13 6.44772 13 7V11H16C16.5523 11 17 11.4477 17 12C17 12.5523 16.5523 13 16 13H12C11.4477 13 11 12.5523 11 12V7Z"
        fill="currentColor"
      />
    </g>
  </svg>
));
IconClock.displayName = 'IconClock';
