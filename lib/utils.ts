import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Concatenates and merges Tailwind CSS class names conditionally.
 * 
 * Usage:
 *   cn("p-4", condition && "bg-red-500", otherClassName)
 * 
 * @param inputs Any number of class name values, which can be strings, arrays, objects, or falsy values.
 * @returns A single string of merged Tailwind CSS class names.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(...inputs))
}
