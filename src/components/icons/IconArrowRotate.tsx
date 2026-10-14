import { forwardRef, type SVGProps } from 'react';

/** Arrow Rotate icon — 24x24, outline style, currentColor-based (Figma: Icon / Arrow Rotate) */
export const IconArrowRotate = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>((props, ref) => (
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
      d="M3 12C3 7.92595 5.73573 4.36105 9.6709 3.30661C12.6318 2.51327 15.7148 3.2902 17.9277 5.22653V3.09958C17.9277 2.54745 18.3757 2.09983 18.9277 2.09958C19.48 2.09958 19.9277 2.54729 19.9277 3.09958V7.99997C19.9275 8.55207 19.4799 8.99997 18.9277 8.99997H13.9277C13.3758 8.99972 12.9279 8.55192 12.9277 7.99997C12.9277 7.44784 13.3757 7.00022 13.9277 6.99997H16.8984C15.1634 5.29961 12.6233 4.58586 10.1885 5.23825C7.12764 6.05841 5 8.83119 5 12C5.00017 15.1686 7.12777 17.9406 10.1885 18.7607C13.2492 19.5808 16.4781 18.2441 18.0625 15.5C18.3386 15.0218 18.9495 14.8578 19.4277 15.1338C19.906 15.4099 20.0701 16.0217 19.7939 16.5C17.7569 20.0278 13.6058 21.7476 9.6709 20.6933C5.73586 19.6389 3.00018 16.0738 3 12Z"
      fill="currentColor"
    />
  </svg>
));
IconArrowRotate.displayName = 'IconArrowRotate';
