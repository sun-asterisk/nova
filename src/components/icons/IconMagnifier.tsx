import { forwardRef, type SVGProps } from 'react';

/** Magnifier icon — 24x24, outline style, currentColor-based (Figma: Icon / Magnifier) */
export const IconMagnifier = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>((props, ref) => (
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
        d="M15.7998 10.4004C15.7998 7.41818 13.3825 5.00021 10.4004 5C7.41805 5 5 7.41805 5 10.4004C5.00021 13.3825 7.41818 15.7998 10.4004 15.7998C13.3824 15.7996 15.7996 13.3824 15.7998 10.4004ZM17.7998 10.4004C17.7996 14.487 14.487 17.7996 10.4004 17.7998C6.31361 17.7998 3.00021 14.4871 3 10.4004C3 6.31348 6.31348 3 10.4004 3C14.4871 3.00021 17.7998 6.31361 17.7998 10.4004Z"
        fill="currentColor"
      />
      <path
        d="M14.2179 14.2179C14.6085 13.8274 15.2415 13.8274 15.632 14.2179L20.7072 19.2931C21.0975 19.6837 21.0977 20.3167 20.7072 20.7072C20.3167 21.0977 19.6837 21.0975 19.2931 20.7072L14.2179 15.632C13.8274 15.2415 13.8274 14.6085 14.2179 14.2179Z"
        fill="currentColor"
      />
    </g>
  </svg>
));
IconMagnifier.displayName = 'IconMagnifier';
