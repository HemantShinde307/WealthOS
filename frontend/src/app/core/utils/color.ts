/** Small colour helpers used by tenant branding. Only ever operate on validated `#RRGGBB` values. */
const HEX = /^#[0-9a-fA-F]{6}$/;

export function isHexColor(v: unknown): v is string {
  return typeof v === 'string' && HEX.test(v);
}

function channels(hex: string): [number, number, number] {
  return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
}

function toHex(rgb: number[]): string {
  return '#' + rgb.map((c) => Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, '0')).join('');
}

function luminance(hex: string): number {
  const [r, g, b] = channels(hex).map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/** Readable text colour (near-black or white) for content placed on `bg`. */
export function onColor(bg: string): string {
  return contrastRatio(bg, '#ffffff') >= contrastRatio(bg, '#0b1c30') ? '#ffffff' : '#0b1c30';
}

/** Darkens `hex` until it reaches at least 3:1 against white, so it stays legible as link/accent text. */
export function readableAccent(hex: string): string {
  let rgb = channels(hex);
  for (let i = 0; i < 20 && contrastRatio(toHex(rgb), '#ffffff') < 3; i++) {
    rgb = rgb.map((c) => c * 0.85) as [number, number, number];
  }
  return toHex(rgb);
}
