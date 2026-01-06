import { startOfDay, endOfDay, format, parseISO, isToday, differenceInDays } from "date-fns";

/**
 * Get the start of today in the user's local timezone
 */
export function getLocalStartOfDay(date: Date = new Date()): Date {
  return startOfDay(date);
}

/**
 * Get the end of today in the user's local timezone
 */
export function getLocalEndOfDay(date: Date = new Date()): Date {
  return endOfDay(date);
}

/**
 * Format a date for display
 */
export function formatDate(date: Date | string, formatStr: string = "MMM d, yyyy"): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, formatStr);
}

/**
 * Format a date for API requests (ISO string)
 */
export function toISODateString(date: Date): string {
  return date.toISOString();
}

/**
 * Check if a date is today in the user's local timezone
 */
export function isLocalToday(date: Date | string): boolean {
  const d = typeof date === "string" ? parseISO(date) : date;
  return isToday(d);
}

/**
 * Get the number of consecutive days with entries (streak)
 */
export function calculateStreak(dates: Date[]): number {
  if (dates.length === 0) return 0;

  // Sort dates in descending order (most recent first)
  const sortedDates = dates
    .map((d) => startOfDay(d))
    .sort((a, b) => b.getTime() - a.getTime());

  // Check if the most recent entry is today or yesterday
  const today = startOfDay(new Date());
  const mostRecent = sortedDates[0];
  const daysDiff = differenceInDays(today, mostRecent);

  // If the most recent entry is older than yesterday, streak is broken
  if (daysDiff > 1) return 0;

  let streak = 1;
  for (let i = 1; i < sortedDates.length; i++) {
    const diff = differenceInDays(sortedDates[i - 1], sortedDates[i]);
    if (diff === 1) {
      streak++;
    } else if (diff > 1) {
      break;
    }
    // If diff === 0, same day, continue without incrementing
  }

  return streak;
}

/**
 * Format time for display (e.g., "2:30 PM")
 */
export function formatTime(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "h:mm a");
}

/**
 * Get a friendly date label (Today, Yesterday, or the date)
 */
export function getFriendlyDateLabel(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  const today = startOfDay(new Date());
  const inputDay = startOfDay(d);
  const diff = differenceInDays(today, inputDay);

  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return formatDate(d);
}

