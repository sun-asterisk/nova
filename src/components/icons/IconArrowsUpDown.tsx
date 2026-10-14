import { forwardRef, type SVGProps } from 'react';

/** Up and down arrows icon — 24x24, outline style, currentColor-based (Figma: Icon / Arrows Up Down) */
export const IconArrowsUpDown = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>((props, ref) => (
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
      d="M6 19V7.41406L3.70703 9.70703C3.31651 10.0976 2.68349 10.0976 2.29297 9.70703C1.90245 9.31651 1.90245 8.68349 2.29297 8.29297L6.29297 4.29297L6.36914 4.22461C6.76192 3.90426 7.34092 3.92685 7.70703 4.29297L11.707 8.29297C12.0976 8.68349 12.0976 9.31651 11.707 9.70703C11.3165 10.0976 10.6835 10.0976 10.293 9.70703L8 7.41406V19C8 19.5523 7.55229 20 7 20C6.44772 20 6 19.5523 6 19ZM16 5C16 4.44772 16.4477 4 17 4C17.5523 4 18 4.44772 18 5V16.5859L20.293 14.293C20.6835 13.9024 21.3165 13.9024 21.707 14.293C22.0976 14.6835 22.0976 15.3165 21.707 15.707L17.707 19.707C17.3165 20.0976 16.6835 20.0976 16.293 19.707L12.293 15.707C11.9024 15.3165 11.9024 14.6835 12.293 14.293C12.6835 13.9024 13.3165 13.9024 13.707 14.293L16 16.5859V5Z"
      fill="currentColor"
    />
  </svg>
));
IconArrowsUpDown.displayName = 'IconArrowsUpDown';
