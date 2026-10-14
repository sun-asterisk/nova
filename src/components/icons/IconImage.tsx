import { forwardRef, type SVGProps } from 'react';

/** Image icon — 24x24, outline style, currentColor-based (Figma: Icon / Image) */
export const IconImage = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>((props, ref) => (
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
        d="M19 6C19 5.44772 18.5523 5 18 5H6C5.44772 5 5 5.44772 5 6V18C5 18.5523 5.44772 19 6 19H18C18.5523 19 19 18.5523 19 18V6ZM21 18C21 19.6569 19.6569 21 18 21H6C4.34315 21 3 19.6569 3 18V6C3 4.34315 4.34315 3 6 3H18C19.6569 3 21 4.34315 21 6V18Z"
        fill="currentColor"
      />
      <path
        d="M11 8.5C11 9.32843 10.3284 10 9.5 10C8.67157 10 8 9.32843 8 8.5C8 7.67157 8.67157 7 9.5 7C10.3284 7 11 7.67157 11 8.5Z"
        fill="currentColor"
      />
      <path
        d="M14.4727 10.3738C15.2716 9.42845 16.7284 9.42845 17.5274 10.3738L20.7637 14.2049C21.1201 14.6267 21.0674 15.2576 20.6455 15.6141C20.2236 15.9705 19.5928 15.9168 19.2364 15.4949L16 11.6648L12.3574 15.9764C11.5584 16.9218 10.1007 16.922 9.30178 15.9764L8.00003 14.4344L4.7637 18.2654C4.40727 18.6872 3.77636 18.7399 3.35452 18.3836C2.93288 18.0271 2.88003 17.3962 3.23636 16.9744L6.47268 13.1443C7.27166 12.1986 8.72839 12.1986 9.52737 13.1443L10.8301 14.6853L14.4727 10.3738Z"
        fill="currentColor"
      />
    </g>
  </svg>
));
IconImage.displayName = 'IconImage';
