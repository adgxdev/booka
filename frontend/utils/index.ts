"use client";

export const USER_STORAGE_KEY = "waitlistUserId";

/**
 * Stores the waitlist user ID in localStorage.
 * @param id - The unique user ID from backend
 */
export function storeUser(id: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(USER_STORAGE_KEY, id);
}

/**
 * Retrieves the stored waitlist user ID from localStorage.
 * @returns The user ID or null if not found.
 */
export function getUser(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(USER_STORAGE_KEY);
}

/**
 * Removes the stored waitlist user ID (for logout or reset)
 */
export function clearUser(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(USER_STORAGE_KEY);
}