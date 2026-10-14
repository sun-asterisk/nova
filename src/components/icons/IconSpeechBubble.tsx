import { forwardRef, type SVGProps } from 'react';

/** Speech Bubble icon — 24x24, outline style, currentColor-based (Figma: Icon / Speech Bubble) */
export const IconSpeechBubble = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>((props, ref) => (
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
      d="M6.61478 4.78811C10.1979 2.11306 15.2016 2.47471 18.3638 5.63577L18.6529 5.93753C21.5452 9.1093 21.8028 13.9137 19.2115 17.3848C16.6155 20.8606 11.9256 21.9745 8.05911 20.0889L4.9722 20.8389C3.88058 21.1038 2.89574 20.119 3.16067 19.0274L3.91067 15.9395C2.02583 12.0733 3.13942 7.38477 6.61478 4.78909V4.78811ZM16.9497 7.04983C14.49 4.59124 10.5978 4.31006 7.81106 6.39065C5.07038 8.43757 4.21669 12.1605 5.76907 15.1905C5.9286 15.502 5.98391 15.8741 5.89505 16.2403L5.29739 18.7012L7.76028 18.1045L7.897 18.0782C8.17206 18.038 8.44565 18.0761 8.68997 18.1758L8.81009 18.2305L9.09524 18.3692C12.0703 19.7282 15.6259 18.8437 17.6089 16.1885L17.7964 15.9239C19.6089 13.2487 19.3517 9.67182 17.1743 7.28421L16.9497 7.04983Z"
      fill="currentColor"
    />
  </svg>
));
IconSpeechBubble.displayName = 'IconSpeechBubble';
