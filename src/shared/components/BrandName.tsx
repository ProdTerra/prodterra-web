export function BrandName() {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element -- A small static SVG needs no image optimization. */}
      <img src="/prodterra-logo.svg" alt="" width={28} height={28} className="brand__logo" />
      <span className="brand__name">ProdTerra</span>
    </>
  );
}
