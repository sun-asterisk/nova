import { forwardRef, type SVGProps } from 'react';

/** File icon — 24x24, outline style, currentColor-based (Figma: Icon / File) */
export const IconFile = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>((props, ref) => (
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
      d="M4.07703 19V4.38477C4.07715 3.06775 5.14478 2.00013 6.46179 2H12.9999C13.9074 2 14.7771 2.36412 15.4139 3.01074L18.9833 6.63574C19.5855 7.24739 19.9226 8.07135 19.9227 8.92969V19C19.9227 20.6569 18.5796 22 16.9227 22H7.07703C5.42017 22 4.07703 20.6569 4.07703 19ZM13.9999 6.92969C13.9999 7.48193 14.4477 7.92962 14.9999 7.92969H17.4501L13.9999 4.4248V6.92969ZM6.07703 19C6.07703 19.5523 6.52474 20 7.07703 20H16.9227C17.475 20 17.9227 19.5523 17.9227 19V9.92969H14.9999C13.3431 9.92962 11.9999 8.5865 11.9999 6.92969V4H6.46179C6.24935 4.00013 6.07715 4.17232 6.07703 4.38477V19Z"
      fill="currentColor"
    />
  </svg>
));
IconFile.displayName = 'IconFile';
