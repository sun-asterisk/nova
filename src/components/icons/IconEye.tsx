import { forwardRef, type SVGProps } from 'react';

/** Eye icon — 24x24, outline style, currentColor-based (Figma: Icon / Eye) */
export const IconEye = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>((props, ref) => (
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
        d="M2.26347 11.6484C5.58804 2.78373 18.4115 2.78382 21.7361 11.6484C21.821 11.8748 21.821 12.1252 21.7361 12.3516C18.4115 21.2162 5.58804 21.2163 2.26347 12.3516C2.17857 12.1252 2.17857 11.8748 2.26347 11.6484ZM19.7225 12C16.8917 5.33362 7.10654 5.33329 4.27616 12C7.10654 18.6667 16.8917 18.6664 19.7225 12Z"
        fill="currentColor"
      />
      <path
        d="M13.75 12C13.75 11.0335 12.9665 10.25 12 10.25C11.0335 10.25 10.25 11.0335 10.25 12C10.25 12.9665 11.0335 13.75 12 13.75C12.9665 13.75 13.75 12.9665 13.75 12ZM15.75 12C15.75 14.0711 14.0711 15.75 12 15.75C9.92893 15.75 8.25 14.0711 8.25 12C8.25 9.92893 9.92893 8.25 12 8.25C14.0711 8.25 15.75 9.92893 15.75 12Z"
        fill="currentColor"
      />
    </g>
  </svg>
));
IconEye.displayName = 'IconEye';
