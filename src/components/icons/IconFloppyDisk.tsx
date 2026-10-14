import { forwardRef, type SVGProps } from 'react';

/** Floppy Disk icon — 24x24, outline style, currentColor-based (Figma: Icon / Floppy Disk) */
export const IconFloppyDisk = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>((props, ref) => (
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
        d="M3 18V6C3 4.34315 4.34315 3 6 3H14.6719C15.4674 3.00008 16.2304 3.31637 16.793 3.87891L20.1211 7.20703C20.6836 7.76957 20.9999 8.53259 21 9.32812V18C21 19.6569 19.6569 21 18 21H6C4.34315 21 3 19.6569 3 18ZM5 18C5 18.5523 5.44772 19 6 19H18C18.5523 19 19 18.5523 19 18V9.32812C18.9999 9.06302 18.8945 8.80856 18.707 8.62109L15.3789 5.29297C15.1914 5.1055 14.937 5.00008 14.6719 5H6C5.44772 5 5 5.44772 5 6V18Z"
        fill="currentColor"
      />
      <path
        d="M8 4C8 3.44772 8.44772 3 9 3C9.55228 3 10 3.44772 10 4V8H14V4C14 3.44772 14.4477 3 15 3C15.5523 3 16 3.44772 16 4V9C16 9.55228 15.5523 10 15 10H9C8.44772 10 8 9.55228 8 9V4Z"
        fill="currentColor"
      />
      <path
        d="M15.5 20V15.5C15.5 14.9477 15.0523 14.5 14.5 14.5H9.5C8.94772 14.5 8.5 14.9477 8.5 15.5V20C8.5 20.5523 8.05228 21 7.5 21C6.94772 21 6.5 20.5523 6.5 20V15.5C6.5 13.8431 7.84315 12.5 9.5 12.5H14.5C16.1569 12.5 17.5 13.8431 17.5 15.5V20C17.5 20.5523 17.0523 21 16.5 21C15.9477 21 15.5 20.5523 15.5 20Z"
        fill="currentColor"
      />
    </g>
  </svg>
));
IconFloppyDisk.displayName = 'IconFloppyDisk';
