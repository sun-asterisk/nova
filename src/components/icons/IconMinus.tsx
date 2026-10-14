import { forwardRef, type SVGProps } from 'react';

/** Minus icon — 24x24, outline style, currentColor-based (Figma: Icon / Minus) */
export const IconMinus = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>((props, ref) => (
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
      d="M17.7252 10.9004C18.3326 10.9005 18.8248 11.3926 18.8248 12C18.8248 12.6074 18.3326 13.0995 17.7252 13.0996H6.27499C5.66748 13.0996 5.17538 12.6075 5.17538 12C5.17538 11.3925 5.66748 10.9004 6.27499 10.9004H17.7252Z"
      fill="currentColor"
    />
  </svg>
));
IconMinus.displayName = 'IconMinus';
