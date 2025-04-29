import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + "..."
}

export function calculateDaysAgo(date: string | Date): string {
  const now = new Date()
  const pastDate = new Date(date)
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
  const date = new Date(dateInput);
  const now = new Date();
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