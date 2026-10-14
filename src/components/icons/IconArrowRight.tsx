import { forwardRef, type SVGProps } from 'react';

/** Arrow Right icon — 24x24, outline style, currentColor-based (Figma: Icon / Arrow Right) */
export const IconArrowRight = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>((props, ref) => (
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
      d="M12.7224 6.29298C13.1129 5.90265 13.746 5.90252 14.1364 6.29298L19.1364 11.293C19.5267 11.6835 19.5267 12.3166 19.1364 12.707L14.1364 17.707C13.746 18.0975 13.1129 18.0974 12.7224 17.707C12.3318 17.3165 12.3318 16.6835 12.7224 16.293L16.0153 13H5.57098C5.0187 13 4.57098 12.5523 4.57098 12C4.57098 11.4477 5.0187 11 5.57098 11H16.0153L12.7224 7.70704C12.3318 7.31651 12.3318 6.6835 12.7224 6.29298Z"
      fill="currentColor"
    />
  </svg>
));
IconArrowRight.displayName = 'IconArrowRight';
