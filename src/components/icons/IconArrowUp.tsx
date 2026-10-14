import { forwardRef, type SVGProps } from 'react';

/** Arrow Up icon — 24x24, outline style, currentColor-based (Figma: Icon / Arrow Up) */
export const IconArrowUp = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>((props, ref) => (
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
      d="M11 18.4294V7.98506L7.70702 11.278C7.31649 11.6685 6.68348 11.6685 6.29295 11.278C5.90243 10.8875 5.90243 10.2545 6.29295 9.86396L11.293 4.86396L11.3691 4.7956C11.7619 4.47525 12.3409 4.49785 12.707 4.86396L17.707 9.86396C18.0975 10.2545 18.0975 10.8875 17.707 11.278C17.3165 11.6685 16.6835 11.6685 16.293 11.278L13 7.98506V18.4294C12.9998 18.9815 12.5521 19.4294 12 19.4294C11.4478 19.4294 11.0002 18.9815 11 18.4294Z"
      fill="currentColor"
    />
  </svg>
));
IconArrowUp.displayName = 'IconArrowUp';
