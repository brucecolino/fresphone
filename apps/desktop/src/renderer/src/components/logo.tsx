export function LogoMark({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="fp-mark" x1="2" y1="4" x2="46" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2C6E9C" />
          <stop offset="0.55" stopColor="#29A99B" />
          <stop offset="1" stopColor="#57C98A" />
        </linearGradient>
      </defs>
      <rect x="3" y="3" width="42" height="42" rx="12" fill="url(#fp-mark)" />
      <rect x="17.5" y="10.5" width="13" height="27" rx="3.4" fill="#fff" fillOpacity="0.16" stroke="#fff" strokeWidth="1.5" />
      <path d="M20.5 27.5a5 5 0 0 0 8.4 1.7" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M27.5 20.5a5 5 0 0 0-8.4-1.7" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M29 16.4v3.4h-3.4" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M19 31.6v-3.4h3.4" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function Logo() {
  return (
    <span className="inline-flex items-center gap-2">
      <LogoMark />
      <span className="text-grad font-display text-base font-bold tracking-tight">FreshPhone</span>
    </span>
  )
}
