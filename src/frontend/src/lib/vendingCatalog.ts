export const JUICE_TYPES = [
  "Maaz",
  "Coke",
  "Lime",
  "Water",
  "Butter Milk",
  "Slice",
  "Sprite",
  "Pepsi",
] as const;

export const SIZE_OPTIONS = [50, 150, 250, 500] as const;

export type JuiceType = (typeof JUICE_TYPES)[number];
export type SizeOption = (typeof SIZE_OPTIONS)[number];

export function formatSize(ml: number): string {
  return `${ml}ml`;
}

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
