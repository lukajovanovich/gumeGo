// Pozadina sa šarama gazećeg sloja guma (dekorativni SVG)
export default function TreadBackground() {
  return (
    <svg className="tread-bg" aria-hidden="true" preserveAspectRatio="xMidYMid slice" viewBox="0 0 1600 1000">
      <defs>
        {/* Usmerena "V" šara (zimska guma) */}
        <pattern id="tread-v" width="80" height="56" patternUnits="userSpaceOnUse">
          <path d="M0 8 L40 30 L80 8 L80 22 L40 44 L0 22 Z" fill="currentColor" />
          <rect x="38" y="0" width="4" height="56" fill="currentColor" opacity="0.5" />
        </pattern>
        {/* Blok šara (terenska guma) */}
        <pattern id="tread-block" width="90" height="70" patternUnits="userSpaceOnUse">
          <rect x="4" y="6" width="36" height="24" rx="5" fill="currentColor" />
          <rect x="50" y="6" width="36" height="24" rx="5" fill="currentColor" />
          <rect x="27" y="40" width="36" height="24" rx="5" fill="currentColor" />
          <rect x="-18" y="40" width="36" height="24" rx="5" fill="currentColor" />
          <rect x="72" y="40" width="36" height="24" rx="5" fill="currentColor" />
        </pattern>
        {/* Letnja šara – podužni kanali sa lamelama */}
        <pattern id="tread-summer" width="140" height="40" patternUnits="userSpaceOnUse">
          <rect x="30" y="0" width="10" height="40" fill="currentColor" />
          <rect x="100" y="0" width="10" height="40" fill="currentColor" />
          <path d="M0 10 L26 30 M44 30 L96 10 M114 10 L140 30" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
        </pattern>
      </defs>

      <g className="tread-strip tread-strip--a">
        <rect x="-200" y="-60" width="260" height="1400" rx="40" fill="url(#tread-v)" transform="rotate(-22 0 0) translate(220 -120)" />
      </g>
      <g className="tread-strip tread-strip--b">
        <rect x="0" y="0" width="220" height="1500" rx="36" fill="url(#tread-block)" transform="translate(1180 -300) rotate(18)" />
      </g>
      <g className="tread-strip tread-strip--c">
        <rect x="0" y="0" width="200" height="1300" rx="34" fill="url(#tread-summer)" transform="translate(620 640) rotate(-70)" />
      </g>

      {/* Bočna strana gume – koncentrični krugovi */}
      <g className="tire-ring" transform="translate(1450 880)">
        <circle r="210" fill="none" stroke="currentColor" strokeWidth="38" />
        <circle r="150" fill="none" stroke="currentColor" strokeWidth="6" strokeDasharray="14 10" />
        <circle r="110" fill="none" stroke="currentColor" strokeWidth="16" />
      </g>
      <g className="tire-ring" transform="translate(110 120)">
        <circle r="150" fill="none" stroke="currentColor" strokeWidth="28" />
        <circle r="100" fill="none" stroke="currentColor" strokeWidth="5" strokeDasharray="10 8" />
      </g>
    </svg>
  )
}
