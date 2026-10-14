import { forwardRef, type SVGProps } from 'react';

/** Exclamation Circle icon — 24x24, outline style, currentColor-based (Figma: Icon / Exclamation Circle) */
export const IconExclamationCircle = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
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
      <g>
        <path
          d="M13.4 16.4C13.4 17.1732 12.7732 17.8 12 17.8C11.2268 17.8 10.6 17.1732 10.6 16.4C10.6 15.6268 11.2268 15 12 15C12.7732 15 13.4 15.6268 13.4 16.4Z"
          fill="currentColor"
        />
        <path
          d="M20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12ZM22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
          fill="currentColor"
        />
        <path
          d="M10.9004 12.5V7.5C10.9004 6.89249 11.3925 6.40039 12 6.40039C12.6075 6.40039 13.0996 6.89249 13.0996 7.5V12.5C13.0996 13.1075 12.6075 13.5996 12 13.5996C11.3925 13.5996 10.9004 13.1075 10.9004 12.5Z"
          fill="currentColor"
        />
      </g>
    </svg>
  ),
);
IconExclamationCircle.displayName = 'IconExclamationCircle';
