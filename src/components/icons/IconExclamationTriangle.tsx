import { forwardRef, type SVGProps } from 'react';

/** Exclamation Triangle icon — 24x24, outline style, currentColor-based (Figma: Icon / Exclamation Triangle) */
export const IconExclamationTriangle = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
  (props, ref) => (
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
          d="M13.3 16.7C13.3 17.418 12.718 18 12 18C11.282 18 10.7 17.418 10.7 16.7C10.7 15.982 11.282 15.4 12 15.4C12.718 15.4 13.3 15.982 13.3 16.7Z"
          fill="currentColor"
        />
        <path
          d="M9.40217 4.69701C10.557 2.69724 13.4438 2.69706 14.5985 4.69701L21.5994 16.824C22.754 18.824 21.3101 21.324 19.0008 21.324H4.99885C2.68956 21.3239 1.24658 18.8239 2.40119 16.824L9.40217 4.69701ZM12.866 5.69701C12.4811 5.03046 11.5185 5.03037 11.1336 5.69701L4.13264 17.824C3.74786 18.4906 4.22916 19.3239 4.99885 19.324H19.0008C19.7706 19.324 20.2519 18.4906 19.867 17.824L12.866 5.69701ZM10.9998 13.4997V9.49974C11 8.94763 11.4477 8.49984 11.9998 8.49974C12.552 8.49974 12.9997 8.94757 12.9998 9.49974V13.4997C12.9998 14.052 12.5521 14.4997 11.9998 14.4997C11.4476 14.4996 10.9998 14.052 10.9998 13.4997Z"
          fill="currentColor"
        />
      </g>
    </svg>
  ),
);
IconExclamationTriangle.displayName = 'IconExclamationTriangle';
