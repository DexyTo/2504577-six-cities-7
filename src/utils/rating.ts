const MAX_RATING = 5;

export function getRatingWidth(rating: number): string {
  return `${Math.round(rating) / MAX_RATING * 100}%`;
}
