import { forwardRef, type SVGProps } from 'react';

/** Check icon — 24x24, outline style, currentColor-based (Figma: Icon / Check) */
export const IconCheck = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>((props, ref) => (
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
      d="M18.2613 6.06681C18.694 5.60202 19.4214 5.57566 19.8863 6.00821C20.351 6.4409 20.3774 7.16834 19.9449 7.63321L10.356 17.934C10.1433 18.1624 9.8467 18.2946 9.5347 18.3002C9.22263 18.3058 8.92142 18.184 8.70072 17.9633L4.08353 13.3461C3.63472 12.8971 3.63479 12.1692 4.08353 11.7201C4.53263 11.271 5.26138 11.271 5.71048 11.7201L9.48392 15.4945L18.2613 6.06681Z"
      fill="currentColor"
    />
  </svg>
));
IconCheck.displayName = 'IconCheck';
