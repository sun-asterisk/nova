import { forwardRef, type SVGProps } from 'react';

/** Arrow Left icon — 24x24, outline style, currentColor-based (Figma: Icon / Arrow Left) */
export const IconArrowLeft = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>((props, ref) => (
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
      d="M9.86394 6.29295C10.2545 5.90243 10.8875 5.90243 11.278 6.29295C11.6685 6.68348 11.6685 7.31649 11.278 7.70702L7.98503 11H18.4294C18.9815 11.0002 19.4294 11.4478 19.4294 12C19.4294 12.5521 18.9815 12.9998 18.4294 13H7.98503L11.278 16.293C11.6685 16.6835 11.6685 17.3165 11.278 17.707C10.8875 18.0975 10.2545 18.0975 9.86394 17.707L4.86394 12.707C4.47341 12.3165 4.47341 11.6835 4.86394 11.293L9.86394 6.29295Z"
      fill="currentColor"
    />
  </svg>
));
IconArrowLeft.displayName = 'IconArrowLeft';
