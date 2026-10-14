import { forwardRef, type SVGProps } from 'react';

/** Arrow Down icon — 24x24, outline style, currentColor-based (Figma: Icon / Arrow Down) */
export const IconArrowDown = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>((props, ref) => (
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
      d="M11 5.57101C11 5.01873 11.4477 4.57101 12 4.57101C12.5523 4.57101 13 5.01873 13 5.57101V16.0154L16.293 12.7224C16.6835 12.3319 17.3165 12.3319 17.707 12.7224C18.0974 13.1129 18.0975 13.746 17.707 14.1364L12.707 19.1364C12.3166 19.5267 11.6835 19.5267 11.293 19.1364L6.29298 14.1364C5.90252 13.746 5.90265 13.1129 6.29298 12.7224C6.6835 12.3319 7.31651 12.3319 7.70704 12.7224L11 16.0154V5.57101Z"
      fill="currentColor"
    />
  </svg>
));
IconArrowDown.displayName = 'IconArrowDown';
