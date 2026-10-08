/** A placeholder QR code (a fixed pattern, not scannable) until the real store link exists. */
export function QrCode({ className = "size-28" }: { className?: string }) {
  const n = 25;
  const finder = (x: number, y: number) => ([[0, 0], [n - 7, 0], [0, n - 7]] as const).some(([fx, fy]) => x >= fx && x < fx + 7 && y >= fy && y < fy + 7);
  const cells: string[] = [];
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    if (finder(x, y) || x === 7 || y === 7 || (x > n - 9 && y === 7)) continue;
    if (((x * 7 + y * 13 + x * y * 5) % 11) % 3 === 0 || (x * y) % 7 === 3) cells.push(`M${x} ${y}h1v1h-1z`);
  }
  const eye = (x: number, y: number) => `M${x} ${y}h7v7h-7zM${x + 1} ${y + 1}v5h5v-5zM${x + 2} ${y + 2}h3v3h-3z`;
  return (
    <svg aria-hidden viewBox={`-1 -1 ${n + 2} ${n + 2}`} className={className} fill="currentColor" shapeRendering="crispEdges">
      <path d={cells.join("")} /><path fillRule="evenodd" d={eye(0, 0) + eye(n - 7, 0) + eye(0, n - 7)} />
    </svg>
  );
}

