import { forwardRef, type SVGProps } from 'react';

/** U-turn arrow pointing left icon — 24x24, outline style, currentColor-based (Figma: Icon / Arrow Uturn Left) */
export const IconArrowUturnLeft = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
        d="M19 14.5C19 12.0147 16.9853 9.99999 14.5 9.99999H6.41405L9.70702 13.293C10.0975 13.6835 10.0975 14.3165 9.70702 14.707C9.31649 15.0975 8.68348 15.0975 8.29295 14.707L3.29295 9.70702C2.90243 9.31649 2.90243 8.68348 3.29295 8.29295L8.29295 3.29295C8.68348 2.90243 9.31649 2.90243 9.70702 3.29295C10.0975 3.68348 10.0975 4.31649 9.70702 4.70702L6.41405 7.99999H14.5C18.0899 7.99999 21 10.9101 21 14.5C21 18.0899 18.0899 21 14.5 21H10.75C10.1977 21 9.74999 20.5523 9.74999 20C9.74999 19.4477 10.1977 19 10.75 19H14.5C16.9853 19 19 16.9853 19 14.5Z"
        fill="currentColor"
      />
    </svg>
  ),
);
IconArrowUturnLeft.displayName = 'IconArrowUturnLeft';
