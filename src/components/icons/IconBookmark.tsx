import { forwardRef, type SVGProps } from 'react';

/** Bookmark icon — 24x24, outline style, currentColor-based (Figma: Icon / Bookmark) */
export const IconBookmark = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>((props, ref) => (
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
      d="M10.7148 15.9014C11.4583 15.2777 12.5417 15.2778 13.2852 15.9014L18 19.8555V4H6V19.8555L10.7148 15.9014ZM20 19.8555C20 21.554 18.0163 22.4799 16.7148 21.3887L12 17.4336L7.28516 21.3887C5.9837 22.4799 4 21.554 4 19.8555V4C4 2.89543 4.89543 2 6 2H18C19.1046 2 20 2.89543 20 4V19.8555Z"
      fill="currentColor"
    />
  </svg>
));
IconBookmark.displayName = 'IconBookmark';
