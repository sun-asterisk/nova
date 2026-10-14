import { forwardRef, type SVGProps } from 'react';

/** Video Camera icon — 24x24, outline style, currentColor-based (Figma: Icon / Video Camera) */
export const IconVideoCamera = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>((props, ref) => (
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
        d="M14 8.5C14 7.94772 13.5523 7.5 13 7.5H5C4.44772 7.5 4 7.94772 4 8.5V15.5C4 16.0523 4.44772 16.5 5 16.5H13C13.5523 16.5 14 16.0523 14 15.5V8.5ZM16 15.5C16 17.1569 14.6569 18.5 13 18.5H5C3.34315 18.5 2 17.1569 2 15.5V8.5C2 6.84315 3.34315 5.5 5 5.5H13C14.6569 5.5 16 6.84315 16 8.5V15.5Z"
        fill="currentColor"
      />
      <path
        d="M14.0674 13.5713C14.2665 13.0564 14.8453 12.8001 15.3603 12.9991L20 14.792V9.20804L15.3603 11.001C14.8453 11.1999 14.2665 10.9437 14.0674 10.4287C13.8683 9.91356 14.1245 9.33382 14.6396 9.13479L19.2793 7.3428C20.5896 6.83661 21.9997 7.80341 22 9.20804V14.792C21.9997 16.1966 20.5896 17.1634 19.2793 16.6573L14.6396 14.8653C14.1245 14.6662 13.8683 14.0865 14.0674 13.5713Z"
        fill="currentColor"
      />
    </g>
  </svg>
));
IconVideoCamera.displayName = 'IconVideoCamera';
