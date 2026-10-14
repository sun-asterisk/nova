import { forwardRef, type SVGProps } from 'react';

/** Arrow Down Line icon — 24x24, outline style, currentColor-based (Figma: Icon / Arrow Down Line) */
export const IconArrowDownLine = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
  (props, ref) => (
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
        d="M20 19C20.5523 19 21 19.4477 21 20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20C3 19.4477 3.44772 19 4 19H20ZM11 3.5C11 2.94772 11.4477 2.5 12 2.5C12.5523 2.5 13 2.94772 13 3.5V13.5859L15.293 11.293C15.6835 10.9024 16.3165 10.9024 16.707 11.293C17.0976 11.6835 17.0976 12.3165 16.707 12.707L12.707 16.707C12.3165 17.0976 11.6835 17.0976 11.293 16.707L7.29297 12.707C6.90244 12.3165 6.90244 11.6835 7.29297 11.293C7.68349 10.9024 8.31651 10.9024 8.70703 11.293L11 13.5859V3.5Z"
        fill="currentColor"
      />
    </svg>
  ),
);
IconArrowDownLine.displayName = 'IconArrowDownLine';
