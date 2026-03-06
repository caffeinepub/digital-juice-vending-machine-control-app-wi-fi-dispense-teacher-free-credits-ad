export const JUICE_TYPES = ["Mazza", "Coke", "Lime", "Water", "Pepsi"] as const;

export const SIZE_OPTIONS = [60, 120, 180, 240] as const;

export type JuiceType = (typeof JUICE_TYPES)[number];
export type SizeOption = (typeof SIZE_OPTIONS)[number];

export function formatSize(ml: number): string {
  return `${ml}ml`;
}

export function formatPrice(rupees: number): string {
  return `₹${rupees}`;
}

export function getDispenseDuration(size: number): number {
  if (size <= 60) return 4;
  if (size <= 120) return 8;
  if (size <= 180) return 12;
  return 16;
}
