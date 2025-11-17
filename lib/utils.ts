import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price)
}

export function calculateAverageRating(ratings: { rating: number }[]): number {
  if (!ratings.length) return 0
  const sum = ratings.reduce((acc, r) => acc + r.rating, 0)
  return Math.round((sum / ratings.length) * 10) / 10
}
