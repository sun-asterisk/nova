import { forwardRef, type SVGProps } from 'react';

/** Check Circle icon — 24x24, outline style, currentColor-based (Figma: Icon / Check Circle) */
export const IconCheckCircle = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>((props, ref) => (
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
        d="M15.5605 8.20241C15.9374 7.79869 16.5709 7.7768 16.9746 8.15358C17.3783 8.53041 17.4002 9.1639 17.0234 9.56764L11.208 15.7971C11.023 15.9954 10.7653 16.1098 10.4941 16.1145C10.223 16.1192 9.96127 16.0143 9.76953 15.8225L7.00098 13.053C6.61048 12.6625 6.61046 12.0294 7.00098 11.6389C7.39149 11.2484 8.02452 11.2484 8.41504 11.6389L10.4521 13.6751L15.5605 8.20241Z"
        fill="currentColor"
      />
    </g>
  </svg>
));
IconCheckCircle.displayName = 'IconCheckCircle';
