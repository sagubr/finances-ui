import type { ClassValue } from 'clsx'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function parseUtcDate(dateStr: string | null | undefined): Date | null {
  if (!dateStr) return null
  // If the string doesn't end with Z and doesn't contain a timezone offset like +03:00, append Z
  const isUtc = dateStr.endsWith('Z') || /[+-]\d{2}:\d{2}$/.test(dateStr)
  const d = new Date(isUtc ? dateStr : `${dateStr}Z`)
  return Number.isNaN(d.getTime()) ? null : d
}
