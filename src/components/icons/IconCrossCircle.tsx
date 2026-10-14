import { forwardRef, type SVGProps } from 'react';

/** Cross Circle icon — 24x24, outline style, currentColor-based (Figma: Icon / Cross Circle) */
export const IconCrossCircle = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>((props, ref) => (
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
        d="M20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12ZM22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
        fill="currentColor"
      />
      <path
        d="M15.0325 7.55296C15.423 7.16244 16.057 7.16244 16.4475 7.55296C16.8377 7.94343 16.8377 8.57656 16.4475 8.96703L13.4143 11.9993L16.4475 15.0325C16.838 15.423 16.838 16.057 16.4475 16.4475C16.057 16.838 15.423 16.838 15.0325 16.4475L11.9993 13.4143L8.96703 16.4475C8.57656 16.8377 7.94343 16.8377 7.55296 16.4475C7.16244 16.057 7.16244 15.423 7.55296 15.0325L10.5852 11.9993L7.55296 8.96703C7.16244 8.5765 7.16244 7.94349 7.55296 7.55296C7.94349 7.16244 8.5765 7.16244 8.96703 7.55296L11.9993 10.5852L15.0325 7.55296Z"
        fill="currentColor"
      />
    </g>
  </svg>
));
IconCrossCircle.displayName = 'IconCrossCircle';
