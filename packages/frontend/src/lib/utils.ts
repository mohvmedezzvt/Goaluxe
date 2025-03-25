import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function validateDueDate(dueDate: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize to start of the day

  const dueDateObj = new Date(dueDate);
  dueDateObj.setHours(0, 0, 0, 0); // Normalize to start of the day

  if (dueDateObj < today) {
    return false;
  }

  return true; // Valid due date
}

function limitCharacters({
  str,
  maxLength,
}: {
  str: string | undefined;
  maxLength: number;
}): string {
  if (typeof str !== "string") {
    throw new TypeError("Input must be a string");
  }

  return str.length > maxLength ? str.slice(0, maxLength) + "..." : str;
}

export function checkDueDate(dueDate: string): {
  isOverdue: boolean;
  daysOverdue: number;
} {
  const now = new Date();
  now.setHours(0, 0, 0, 0); // Normalize to midnight

  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0); // Normalize to midnight

  if (isNaN(due.getTime())) {
    throw new Error(`Invalid date format: ${dueDate}`);
  }

  const timeDiff = Date.now() - due.getTime();
  const daysOverdue = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

  return {
    isOverdue: timeDiff > 0,
    daysOverdue: timeDiff > 0 ? daysOverdue : 0,
  };
}

export default limitCharacters;
