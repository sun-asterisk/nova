import { forwardRef, type SVGProps } from 'react';

/** Info Circle icon — 24x24, outline style, currentColor-based (Figma: Icon / Info Circle) */
export const IconInfoCircle = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>((props, ref) => (
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
        d="M13.4 7.99998C13.4 8.77317 12.7732 9.39998 12 9.39998C11.2268 9.39998 10.6 8.77317 10.6 7.99998C10.6 7.22678 11.2268 6.59998 12 6.59998C12.7732 6.59998 13.4 7.22678 13.4 7.99998Z"
        fill="currentColor"
      />
      <path
        d="M20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12ZM22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
        fill="currentColor"
      />
      <path
        d="M10.8496 16.5V12C10.8496 11.3649 11.3649 10.8496 12 10.8496C12.6351 10.8496 13.1504 11.3649 13.1504 12V16.5C13.1504 17.1351 12.6351 17.6504 12 17.6504C11.3649 17.6504 10.8496 17.1351 10.8496 16.5Z"
        fill="currentColor"
      />
    </g>
  </svg>
));
IconInfoCircle.displayName = 'IconInfoCircle';
