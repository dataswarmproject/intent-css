export interface SpaceScale {
  compact: string;
  related: string;
  separate: string;
  sectioned: string;
}

export interface TypeScale {
  caption: string;
  body: string;
  heading: string;
  title: string;
  display: string;
}

const rem = (n: number): string => `${Number(n.toFixed(3))}rem`;

/**
 * Spacing as relationships, not magic numbers. One base and one ratio produce
 * four perceptually distinct distances:
 *   compact < related < separate < sectioned
 */
export function spaceScale(base: number, ratio: number, density: number): SpaceScale {
  const step = (n: number): string => rem(n * density);
  return {
    compact: step(base / ratio),
    related: step(base),
    separate: step(base * ratio ** 2),
    sectioned: step(base * ratio ** 4),
  };
}

/** Modular type scale from a body size and a ratio. */
export function typeScale(base: number, ratio: number): TypeScale {
  return {
    caption: rem(base / ratio),
    body: rem(base),
    heading: rem(base * ratio ** 2),
    title: rem(base * ratio ** 3),
    display: rem(base * ratio ** 4),
  };
}
