import { forwardRef, type SVGProps } from 'react';

/** U-turn arrow pointing right icon — 24x24, outline style, currentColor-based (Figma: Icon / Arrow Uturn Right) */
export const IconArrowUturnRight = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
        d="M3 14.5C3 10.9101 5.91012 7.99999 9.5 7.99999H17.5859L14.293 4.70702C13.9024 4.31649 13.9024 3.68348 14.293 3.29295C14.6835 2.90243 15.3165 2.90243 15.707 3.29295L20.707 8.29295C21.0976 8.68348 21.0976 9.31649 20.707 9.70702L15.707 14.707C15.3165 15.0975 14.6835 15.0975 14.293 14.707C13.9024 14.3165 13.9024 13.6835 14.293 13.293L17.5859 9.99999H9.5C7.01468 9.99999 5 12.0147 5 14.5C5 16.9853 7.01468 19 9.5 19H13.25C13.8023 19 14.25 19.4477 14.25 20C14.25 20.5523 13.8023 21 13.25 21H9.5C5.91012 21 3 18.0899 3 14.5Z"
        fill="currentColor"
      />
    </svg>
  ),
);
IconArrowUturnRight.displayName = 'IconArrowUturnRight';
