import { forwardRef, type SVGProps } from 'react';

/** Copy icon — 24x24, outline style, currentColor-based (Figma: Icon / Copy) */
export const IconCopy = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>((props, ref) => (
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
      d="M15 10C15 9.44772 14.5523 9 14 9H6C5.44772 9 5 9.44772 5 10V18C5 18.5523 5.44772 19 6 19H14C14.5523 19 15 18.5523 15 18V10ZM17 15H18C18.5523 15 19 14.5523 19 14V6C19 5.44772 18.5523 5 18 5H10C9.44772 5 9 5.44772 9 6V7H14C15.6569 7 17 8.34315 17 10V15ZM21 14C21 15.6569 19.6569 17 18 17H17V18C17 19.6569 15.6569 21 14 21H6C4.34315 21 3 19.6569 3 18V10C3 8.34315 4.34315 7 6 7H7V6C7 4.34315 8.34315 3 10 3H18C19.6569 3 21 4.34315 21 6V14Z"
      fill="currentColor"
    />
  </svg>
));
IconCopy.displayName = 'IconCopy';
