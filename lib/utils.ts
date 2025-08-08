import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// IST Timezone offset (+5:30)
const IST_OFFSET = 5.5 * 60 * 60 * 1000; // 5.5 hours in milliseconds

/**
 * Convert any date to IST timezone
 */
export function toIST(date: string | Date | number): Date {
  const inputDate = new Date(date);
  // Get UTC time and add IST offset
  const utcTime = inputDate.getTime() + (inputDate.getTimezoneOffset() * 60000);
  return new Date(utcTime + IST_OFFSET);
}

/**
 * Format date in IST with default format
 */
export function formatDate(date: string | Date): string {
  const istDate = toIST(date);
  return istDate.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Kolkata"
  })
}

/**
 * Format date and time in IST
 */
export function formatDateTime(date: string | Date): string {
  const istDate = toIST(date);
  return istDate.toLocaleString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kolkata"
  })
}

/**
 * Format time only in IST
 */
export function formatTime(date: string | Date): string {
  const istDate = toIST(date);
  return istDate.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kolkata"
  })
}

/**
 * Format date for display with IST timezone indicator
 */
export function formatDateWithTimezone(date: string | Date): string {
  const istDate = toIST(date);
  return istDate.toLocaleString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kolkata"
  }) + " IST"
}

/**
 * Format time for chat messages (assumes timestamp is already in IST from backend)
 */
export function formatChatTime(date: string | Date): string {
  const inputDate = new Date(date);
  return inputDate.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kolkata"
  })
}

/**
 * Format date for short display (MMM DD, YYYY)
 */
export function formatDateShort(date: string | Date): string {
  const istDate = toIST(date);
  return istDate.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "Asia/Kolkata"
  })
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + "..."
}

export function calculateDaysAgo(date: string | Date): string {
  const now = toIST(new Date())
  const pastDate = toIST(date)
  const diffTime = Math.abs(now.getTime() - pastDate.getTime())
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return "Today"
  if (diffDays === 1) return "Yesterday"
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
  return `${Math.floor(diffDays / 365)} years ago`
}

export function generateRandomId(): string {
  return Math.random().toString(36).substring(2, 15)
}

export function formatSalaryRange(min?: number | null, max?: number | null): string {
  const formatValue = (value: number): string => {
    // Simple K formatting for large numbers
    if (value >= 1000) {
      return `${Math.round(value / 1000)}k`;
    }
    return `${value}`;
  };

  if (min && max) {
    if (min === max) {
      return `${formatValue(min)}/year`;
    }
    return `${formatValue(min)} - ${formatValue(max)}/year`;
  } else if (min) {
    return `From ${formatValue(min)}/year`;
  } else if (max) {
    return `Up to ${formatValue(max)}/year`;
  } else {
    return "Salary not specified"; // Or return an empty string or null
  }
}

export function formatRelativeTime(dateInput: string | Date | number): string {
  const date = toIST(dateInput);
  const now = toIST(new Date());
  const seconds = Math.round((now.getTime() - date.getTime()) / 1000);

  const minute = 60;
  const hour = minute * 60;
  const day = hour * 24;
  const week = day * 7;
  const month = day * 30; // Approximate
  const year = day * 365; // Approximate

  if (seconds < minute) {
    return seconds < 10 ? "just now" : `${seconds} seconds ago`;
  } else if (seconds < hour) {
    const minutes = Math.round(seconds / minute);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (seconds < day) {
    const hours = Math.round(seconds / hour);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (seconds < week) {
    const days = Math.round(seconds / day);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else if (seconds < month) {
    const weeks = Math.round(seconds / week);
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  } else if (seconds < year) {
    const months = Math.round(seconds / month);
    return `${months} month${months > 1 ? 's' : ''} ago`;
  } else {
    const years = Math.round(seconds / year);
    return `${years} year${years > 1 ? 's' : ''} ago`;
  }
}