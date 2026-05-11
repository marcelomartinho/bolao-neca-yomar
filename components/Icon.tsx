type IconProps = { s?: number; className?: string };

function base(s: number, className?: string) {
  return {
    width: s,
    height: s,
    viewBox: "0 0 24 24",
    fill: "none" as const,
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
  };
}

export const Icon = {
  Check: ({ s = 16, className }: IconProps) => (
    <svg {...base(s, className)} aria-hidden>
      <path d="M5 12l4 4 10-10" />
    </svg>
  ),
  Trophy: ({ s = 18, className }: IconProps) => (
    <svg {...base(s, className)} aria-hidden>
      <path d="M8 4h8v4a4 4 0 11-8 0V4z" />
      <path d="M6 4H4v2a3 3 0 003 3M18 4h2v2a3 3 0 01-3 3" />
      <path d="M9 14h6l-1 4h-4l-1-4zM7 22h10" />
    </svg>
  ),
  Share: ({ s = 14, className }: IconProps) => (
    <svg {...base(s, className)} aria-hidden>
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="6" r="3" />
      <circle cx="18" cy="18" r="3" />
      <path d="M8.6 10.5l6.8-3M8.6 13.5l6.8 3" />
    </svg>
  ),
  Download: ({ s = 14, className }: IconProps) => (
    <svg {...base(s, className)} aria-hidden>
      <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />
    </svg>
  ),
  Whatsapp: ({ s = 14, className }: IconProps) => (
    <svg {...base(s, className)} aria-hidden>
      <path d="M21 12a9 9 0 11-3.5-7.1L21 3l-1.9 3.5A9 9 0 0121 12z" />
      <path d="M8 11c0 4 3 7 7 7l1.5-2-2.5-1-1 1c-1.5-.5-2.5-1.5-3-3l1-1-1-2.5L8 11z" />
    </svg>
  ),
  Mail: ({ s = 16, className }: IconProps) => (
    <svg {...base(s, className)} aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </svg>
  ),
  ArrowRight: ({ s = 14, className }: IconProps) => (
    <svg {...base(s, className)} aria-hidden>
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  ),
};
