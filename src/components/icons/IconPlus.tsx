import { forwardRef, type SVGProps } from 'react';

/** Plus icon — 24x24, outline style, currentColor-based (Figma: Icon / Plus) */
export const IconPlus = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>((props, ref) => (
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
      d="M10.9001 18.4704V13.1003H5.53003C4.92252 13.1003 4.43042 12.6072 4.43042 11.9997C4.43057 11.3923 4.92261 10.9001 5.53003 10.9001H10.9001V5.53C10.9001 4.92258 11.3924 4.43054 11.9998 4.43039C12.6073 4.43039 13.1003 4.92249 13.1003 5.53V10.9001H18.4705C19.0777 10.9003 19.5699 11.3925 19.5701 11.9997C19.5701 12.6071 19.0778 13.1001 18.4705 13.1003H13.1003V18.4704C13.1001 19.0777 12.6071 19.57 11.9998 19.57C11.3925 19.5699 10.9004 19.0777 10.9001 18.4704Z"
      fill="currentColor"
    />
  </svg>
));
IconPlus.displayName = 'IconPlus';
