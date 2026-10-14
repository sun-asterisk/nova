import { forwardRef, type SVGProps } from 'react';

/** Lock icon — 24x24, outline style, currentColor-based (Figma: Icon / Lock) */
export const IconLock = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>((props, ref) => (
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
        d="M18.25 12.5C18.25 11.6716 17.5784 11 16.75 11H7.25C6.42157 11 5.75 11.6716 5.75 12.5V18.5C5.75 19.3284 6.42157 20 7.25 20H16.75C17.5784 20 18.25 19.3284 18.25 18.5V12.5ZM20.25 18.5C20.25 20.433 18.683 22 16.75 22H7.25C5.317 22 3.75 20.433 3.75 18.5V12.5C3.75 10.567 5.317 9 7.25 9H16.75C18.683 9 20.25 10.567 20.25 12.5V18.5Z"
        fill="currentColor"
      />
      <path
        d="M14 10V6.5C14 5.39528 13.1047 4.5 12 4.5C10.8953 4.5 10 5.39528 10 6.5V10C10 10.5523 9.55228 11 9 11C8.44772 11 8 10.5523 8 10V6.5C8 4.29072 9.79072 2.5 12 2.5C14.2093 2.5 16 4.29072 16 6.5V10C16 10.5523 15.5523 11 15 11C14.4477 11 14 10.5523 14 10Z"
        fill="currentColor"
      />
      <path
        d="M13.3 15.5C13.3 16.2179 12.718 16.8 12 16.8C11.282 16.8 10.7 16.2179 10.7 15.5C10.7 14.782 11.282 14.2 12 14.2C12.718 14.2 13.3 14.782 13.3 15.5Z"
        fill="currentColor"
      />
    </g>
  </svg>
));
IconLock.displayName = 'IconLock';
