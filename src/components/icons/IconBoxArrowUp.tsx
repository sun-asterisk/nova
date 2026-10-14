import { forwardRef, type SVGProps } from 'react';

/** Box Arrow Up icon — 24x24, outline style, currentColor-based (Figma: Icon / Box Arrow Up) */
export const IconBoxArrowUp = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>((props, ref) => (
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
        d="M3.75 19V12C3.75 10.3431 5.09315 9 6.75 9H8C8.55228 9 9 9.44772 9 10C9 10.5523 8.55228 11 8 11H6.75C6.19772 11 5.75 11.4477 5.75 12V19C5.75 19.5523 6.19772 20 6.75 20H17.25C17.8023 20 18.25 19.5523 18.25 19V12C18.25 11.4477 17.8023 11 17.25 11H16C15.4477 11 15 10.5523 15 10C15 9.44772 15.4477 9 16 9H17.25C18.9069 9 20.25 10.3431 20.25 12V19C20.25 20.6569 18.9069 22 17.25 22H6.75C5.09315 22 3.75 20.6569 3.75 19Z"
        fill="currentColor"
      />
      <path
        d="M11 14V5.41407L9.20703 7.20704C8.81651 7.59757 8.18349 7.59757 7.79297 7.20704C7.40245 6.81652 7.40245 6.1835 7.79297 5.79298L11.293 2.29298L11.3691 2.22462C11.7619 1.90427 12.3409 1.92686 12.707 2.29298L16.207 5.79298C16.5976 6.1835 16.5976 6.81652 16.207 7.20704C15.8165 7.59757 15.1835 7.59757 14.793 7.20704L13 5.41407V14C13 14.5523 12.5523 15 12 15C11.4477 15 11 14.5523 11 14Z"
        fill="currentColor"
      />
    </g>
  </svg>
));
IconBoxArrowUp.displayName = 'IconBoxArrowUp';
