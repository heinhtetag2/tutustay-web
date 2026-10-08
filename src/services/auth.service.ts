import { createLocalStore } from "./mocks/localStore";

/**
 * MOCK AUTH. Any well-formed email and password "signs in" this browser. There is no account,
 * no token and no server. The real contract is open question Q9; this sits behind a small interface
 * so the adapter can be swapped without touching features.
 */
export interface MockSession {
  email?: string;
  phone?: string;
  method: "email" | "phone" | "google" | "telegram";
}

/** What to show as "who is signed in". */
export function sessionLabel(s: MockSession): string {
  return s.email ?? s.phone ?? "";
}

/**
 * MOCK account deletion (Terms §03): permanent after 30 days, and signing in again within that window reactivates.
 * Records the law requires us to keep (booking and payment history) survive deletion.
 */
export const DELETION_GRACE_DAYS = 30;
export const deletionStore = createLocalStore<{ requestedAt: string } | null>("deletion", null);

export const sessionStore = createLocalStore<MockSession | null>("session", null);

export function signIn(session: MockSession): void {
  sessionStore.set(session);
  deactivatedStore.set(null); // signing in again reactivates a deactivated account
}

export function requestDeletion(): void {
  deletionStore.set({ requestedAt: new Date().toISOString() });
  sessionStore.set(null);
}

export function signOut(): void {
  sessionStore.set(null);
}

/** MOCK: changes the email on the signed-in account. The real flow sends a code to the new address first. */
export function changeEmail(email: string): void {
  const s = sessionStore.get();
  if (s) sessionStore.set({ ...s, email });
}

/** MOCK deactivation: the account is hidden, nothing is deleted, and signing in again brings it back. */
export const deactivatedStore = createLocalStore<{ at: string } | null>("deactivated", null);
export function deactivateAccount(): void {
  deactivatedStore.set({ at: new Date().toISOString() });
  sessionStore.set(null);
}
