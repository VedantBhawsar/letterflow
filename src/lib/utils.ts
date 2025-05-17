import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import _debounce from "lodash/debounce";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Export lodash's debounce function
export const debounce = _debounce;
