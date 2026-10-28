import type { ReactNode } from "react";

/** Sayfanın başı: üst etiket, büyük başlık (sıra numaralı), giriş cümlesi. */
export function PageHeader({
  crumb,
  title,
  number,
  children,
}: {
  crumb: string;
  title: string;
  /** Başlığın sağ üstündeki küçük numara, ör. "04". */
  number?: string;
  children?: ReactNode;
}) {
  return (
    <header>
      <div className="site-crumb">{crumb}</div>
      <h1 className="site-title">
        {title}
        {number && <sup>{number}</sup>}
      </h1>
      {children && <div className="site-lead">{children}</div>}
    </header>
  );
}
