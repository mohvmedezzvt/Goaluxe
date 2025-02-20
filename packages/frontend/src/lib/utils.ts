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
