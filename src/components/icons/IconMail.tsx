import { forwardRef, type SVGProps } from 'react';

/** Mail icon — 24x24, outline style, currentColor-based (Figma: Icon / Mail) */
export const IconMail = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>((props, ref) => (
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
        d="M20 7.577C20 6.74857 19.3284 6.077 18.5 6.077H5.5C4.67157 6.077 4 6.74857 4 7.577V16.4227C4 17.2511 4.67157 17.9227 5.5 17.9227H18.5C19.3284 17.9227 20 17.2511 20 16.4227V7.577ZM22 16.4227C22 18.3557 20.433 19.9227 18.5 19.9227H5.5C3.567 19.9227 2 18.3557 2 16.4227V7.577C2 5.644 3.567 4.077 5.5 4.077H18.5C20.433 4.077 22 5.644 22 7.577V16.4227Z"
        fill="currentColor"
      />
      <path
        d="M17.0363 8.23149C17.4604 7.87814 18.0909 7.93555 18.4445 8.35942C18.7981 8.78368 18.7408 9.41502 18.3165 9.7686L14.2404 13.1651C12.9424 14.2468 11.0569 14.2468 9.75893 13.1651L5.68275 9.7686C5.25855 9.41501 5.20126 8.78366 5.55482 8.35942C5.90842 7.93521 6.53976 7.87792 6.964 8.23149L11.0392 11.629C11.5954 12.0925 12.4038 12.0924 12.9601 11.629L17.0363 8.23149Z"
        fill="currentColor"
      />
    </g>
  </svg>
));
IconMail.displayName = 'IconMail';
