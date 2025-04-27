import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Debounce function to prevent rapid firing of events
 * @param func Function to debounce
 * @param wait Wait time in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: unknown[]) => unknown>( // Changed unknown[] to any[] for broader compatibility, but unknown[] is safer if it works for your use case.
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  // Return a function that captures the arguments using a closure
  return function (this: ThisParameterType<T>, ...args: Parameters<T>): void {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const context = this; // Capture the 'this' context

    // The function to execute after the wait time
    const later = () => {
      timeout = null;
      // Call the original function with the correct 'this' context and arguments
      func.apply(context, args);
    };

    // Clear any existing timeout
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    // Set a new timeout
    timeout = setTimeout(later, wait);
  };
}

/**
 * Format a date string to a readable format
 * @param date Date to format
 * @returns Formatted date string
 */
export function formatDateString(date: Date | string): string {
  // Allow string input as well
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date instanceof Date ? date : new Date(date));
}

/**
 * Validate email format
 * @param email Email to validate
 * @returns Boolean indicating if email is valid
 */
export function validateEmail(email: string): boolean {
  // Improved regex for common email patterns, though perfect validation is complex
  const re =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return re.test(email);
}

/**
 * Generate a random ID
 * @param length Length of the ID
 * @returns Random ID string
 */
export function generateId(length: number = 8): string {
  // Ensure length is reasonable
  const effectiveLength = Math.max(1, Math.min(length, 11)); // Math.random().toString(36) has limited length
  return Math.random()
    .toString(36)
    .substring(2, 2 + effectiveLength);
}

/**
 * Format a number with comma separators
 * @param num Number to format
 * @returns Formatted number string
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US").format(num); // Specify locale for consistency
}

/**
 * Truncate a string to a maximum length
 * @param str String to truncate
 * @param maxLength Maximum length
 * @returns Truncated string
 */
export function truncateString(str: string | null | undefined, maxLength: number): string {
  if (!str) return ""; // Handle null/undefined input
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + "...";
}

/**
 * Convert hex color to rgba
 * @param hex Hex color code (e.g., #RRGGBB or #RGB)
 * @param alpha Alpha value (0 to 1)
 * @returns RGBA color string or empty string if invalid hex
 */
export function hexToRgba(hex: string, alpha: number = 1): string {
  if (!/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
    console.error("Invalid hex color format:", hex);
    return ""; // Return empty or throw error for invalid format
  }

  let hexValue = hex.substring(1); // Remove #

  // Expand shorthand form (e.g., "03F") to full form (e.g., "0033FF")
  if (hexValue.length === 3) {
    hexValue = hexValue[0] + hexValue[0] + hexValue[1] + hexValue[1] + hexValue[2] + hexValue[2];
  }

  const r = parseInt(hexValue.slice(0, 2), 16);
  const g = parseInt(hexValue.slice(2, 4), 16);
  const b = parseInt(hexValue.slice(4, 6), 16);

  // Clamp alpha value
  const effectiveAlpha = Math.max(0, Math.min(1, alpha));

  return `rgba(${r}, ${g}, ${b}, ${effectiveAlpha})`;
}
