/**
 * Kapatma kutusunun ikonu. İki çizim birlikte gelir, kişilik hangisinin
 * görüneceğini CSS'te seçer: yuvarlak uçlu × ya da Retro'da 2px'lik
 * piksellerden bir ×. Card, Dialog, Drawer ve Toast aynı ikonu kullanır.
 */
export function CloseIcon() {
  return (
    <>
      <svg
        aria-hidden="true"
        className="plonk-close-smooth"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
      >
        <path d="M4 4l8 8M12 4l-8 8" />
      </svg>
      <svg
        aria-hidden="true"
        className="plonk-close-pixel"
        viewBox="0 0 5 5"
        fill="currentColor"
        shapeRendering="crispEdges"
      >
        <path d="M0 0h1v1H0zM4 0h1v1H4zM1 1h1v1H1zM3 1h1v1H3zM2 2h1v1H2zM1 3h1v1H1zM3 3h1v1H3zM0 4h1v1H0zM4 4h1v1H4z" />
      </svg>
    </>
  );
}
