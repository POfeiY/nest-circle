export function lerp(a: number, b: number, t: number): number {
  if (t < 0)
    return a
  return a + (b - a) * t
}
