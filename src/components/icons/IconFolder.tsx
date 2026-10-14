import { forwardRef, type SVGProps } from 'react';

/** Folder icon — 24x24, outline style, currentColor-based (Figma: Icon / Folder) */
export const IconFolder = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>((props, ref) => (
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
      d="M3 17.25V7.5C3 5.84315 4.34315 4.5 6 4.5H9.68555C10.4687 4.5 11.2209 4.80647 11.7812 5.35352L12.7158 6.26562C12.9025 6.44789 13.1531 6.54973 13.4141 6.5498H18C19.6568 6.54981 20.9999 7.89304 21 9.5498V17.25C21 18.9069 19.6569 20.25 18 20.25H6C4.34315 20.25 3 18.9069 3 17.25ZM5 17.25C5 17.8023 5.44772 18.25 6 18.25H18C18.5523 18.25 19 17.8023 19 17.25V9.5498C18.9999 8.99761 18.5522 8.54981 18 8.5498H13.4141C12.631 8.54973 11.8787 8.24327 11.3184 7.69629L10.3838 6.78418C10.197 6.60203 9.94644 6.5 9.68555 6.5H6C5.44772 6.5 5 6.94772 5 7.5V17.25Z"
      fill="currentColor"
    />
  </svg>
));
IconFolder.displayName = 'IconFolder';
