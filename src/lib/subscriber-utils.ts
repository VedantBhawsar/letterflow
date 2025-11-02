import { format } from "date-fns";

/**
 * Formats a subscriber's first and last name into a display string
 * @param firstName - The subscriber's first name (can be null)
 * @param lastName - The subscriber's last name (can be null)
 * @returns Formatted name string or "—" if both are null
 */
export function formatName(
  firstName: string | null | undefined,
  lastName: string | null | undefined
): string {
  if (firstName && lastName) {
    return `${firstName} ${lastName}`;
  } else if (firstName) {
    return firstName;
  } else if (lastName) {
    return lastName;
  } else {
    return "—";
  }
}

/**
 * Formats a date string into a readable format
 * @param dateString - ISO date string or Date object
 * @param formatString - Optional format string (defaults to "MMM d, yyyy")
 * @returns Formatted date string or "Invalid date" on error
 */
export function formatDate(
  dateString: string | Date | undefined,
  formatString: string = "MMM d, yyyy"
): string {
  if (!dateString) return "—";
  
  try {
    return format(new Date(dateString), formatString);
  } catch (e) {
    return "Invalid date";
  }
}

/**
 * Gets the status badge color class names (includes dark mode variants for some statuses)
 * @param status - The subscriber or campaign status
 * @returns Tailwind CSS class names for the badge
 */
export function getStatusBadgeColor(status: string): string {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800";
    case "unsubscribed":
      return "bg-yellow-100 text-yellow-800";
    case "bounced":
      return "bg-red-100 text-red-800";
    case "complained":
      return "bg-orange-100 text-orange-800";
    case "sent":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    case "scheduled":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
    case "draft":
      return "bg-gray-100 text-gray-800 dark:bg-gray-700/30 dark:text-gray-400";
    case "archived":
      return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

/**
 * Gets the status badge color class names for dark mode styling
 * @param status - The subscriber or campaign status
 * @returns Tailwind CSS class names for the badge in dark mode
 */
export function getStatusBadgeDark(status: string): string {
  switch (status) {
    case "active":
      return "bg-emerald-900/30 text-emerald-400 hover:bg-emerald-900/40";
    case "unsubscribed":
      return "border-slate-700 text-slate-400 hover:border-slate-600";
    case "bounced":
      return "bg-red-900/30 text-red-400 hover:bg-red-900/40";
    case "complained":
      return "bg-amber-900/30 text-amber-400 hover:bg-amber-900/40";
    default:
      return "bg-slate-800 text-slate-300 hover:bg-slate-700";
  }
}
