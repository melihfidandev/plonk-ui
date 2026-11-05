/**
 * Plonk işareti: dört kişiliğin rengi 2×2 karede, sert gölgenin üstünde.
 * Sekme ikonu (app/icon.svg) ile aynı çizim; burada renkler site değişkenlerinden,
 * üstüne gelince kareler gölgeye doğru basılır.
 */
export function LogoMark() {
  return (
    <svg className="site-logo-mark" viewBox="0 0 32 32" aria-hidden="true">
      <rect className="site-logo-shadow" x="5" y="5" width="24" height="24" />
      <g className="site-logo-tiles" strokeWidth="2.2">
        <rect x="2" y="2" width="12" height="12" fill="#FFD23F" />
        <rect x="14" y="2" width="12" height="12" fill="#5B4CFF" />
        <rect x="2" y="14" width="12" height="12" fill="#E3170A" />
        <rect x="14" y="14" width="12" height="12" fill="#23E5FF" />
      </g>
    </svg>
  );
}
