import type { SVGProps } from "react";

export const ChevronIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg width="10" height="10" viewBox="0 0 16 16" {...props}>
    <path
      d="M5 3l5 5-5 5"
      stroke="currentColor"
      strokeWidth="1.6"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const FolderIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg width="16" height="16" viewBox="0 0 16 16" {...props}>
    <path
      d="M1.5 3.5h4l1.2 1.5h7.3a.5.5 0 01.5.5v7a.5.5 0 01-.5.5h-12a.5.5 0 01-.5-.5v-9a.5.5 0 01.5-.5z"
      stroke="currentColor"
      strokeWidth="1.2"
      fill="none"
      strokeLinejoin="round"
    />
  </svg>
);

export const FileIcon = ({
  active,
  ...props
}: SVGProps<SVGSVGElement> & { active?: boolean }) => (
  <svg width="13" height="13" viewBox="0 0 16 16" {...props}>
    <path
      d="M4 1.5h5.5L12.5 4.5V14a.5.5 0 01-.5.5H4a.5.5 0 01-.5-.5v-12a.5.5 0 01.5-.5z"
      stroke="currentColor"
      strokeWidth="1.1"
      fill={active ? "currentColor" : "none"}
      strokeLinejoin="round"
    />

    <path
      d="M9.5 1.5V4.5H12.5"
      stroke={active ? "var(--color-background)" : "currentColor"}
      strokeWidth="1.1"
      fill="none"
      strokeLinejoin="round"
    />
  </svg>
);
