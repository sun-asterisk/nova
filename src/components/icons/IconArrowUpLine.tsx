import { forwardRef, type SVGProps } from 'react';

/** Arrow Up Line icon — 24x24, outline style, currentColor-based (Figma: Icon / Arrow Up Line) */
export const IconArrowUpLine = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>((props, ref) => (
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
      d="M20 19C20.5523 19 21 19.4477 21 20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20C3 19.4477 3.44772 19 4 19H20ZM11 16V5.91407L8.70703 8.20704C8.31651 8.59757 7.68349 8.59757 7.29297 8.20704C6.90244 7.81652 6.90244 7.1835 7.29297 6.79298L11.293 2.79298L11.3691 2.72462C11.7619 2.40427 12.3409 2.42686 12.707 2.79298L16.707 6.79298C17.0976 7.1835 17.0976 7.81652 16.707 8.20704C16.3165 8.59757 15.6835 8.59757 15.293 8.20704L13 5.91407V16C13 16.5523 12.5523 17 12 17C11.4477 17 11 16.5523 11 16Z"
      fill="currentColor"
    />
  </svg>
));
IconArrowUpLine.displayName = 'IconArrowUpLine';
