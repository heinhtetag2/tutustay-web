import { createLocalStore } from "./mocks/localStore";

/** MOCK profile details, kept in this browser only. The real fields and contract belong to the account API (open question Q9). */
export type Gender = "male" | "female" | "other" | "none";
export interface ProfileDetails {
  name?: string; phone?: string; country?: string; nrc?: string; address?: string;
  gender?: Gender;
  /** ISO date (YYYY-MM-DD). */
  dob?: string;
  altPhone?: string;
  /** A small square picture as a data URL, kept in this browser only. */
  photo?: string;
}
export const profileStore = createLocalStore<ProfileDetails>("profile", {});

/** Notification preferences and which notification ids the guest has read. Mock: this browser only. */
export interface NotificationPrefs { bookings: boolean; deals: boolean }
export const notificationPrefsStore = createLocalStore<NotificationPrefs>("notificationPrefs", { bookings: true, deals: true });
export const readNotificationsStore = createLocalStore<string[]>("readNotifications", []);

/** A readable default name when the guest has not set one: the part of the email before the @. */
export function defaultName(email?: string, phone?: string): string {
  if (email) return email.split("@")[0] ?? "";
  return phone ?? "";
}
