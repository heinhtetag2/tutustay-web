/**
 * ASSUMPTION: how long a guest has to pay online after the hotel accepts.
 * The live system is inconsistent (docs/01): the spec says 48h, the code uses 15 minutes (and 1 minute for pending
 * bookings, marked "TESTING"). Product must decide; the UI reads this from the booking, so it will follow the backend.
 */
export const MOCK_PAY_WINDOW_MINUTES = 30;
