/**
 * Product-policy switches whose real answer is an open question. Each default is the most
 * conservative reading of the evidence in docs/01-product-audit.md.
 */
export const FEATURES = {
  /** Q7. The live property page shows a Call button before booking (matched here); the FAQ says after. The Terms say the app shows the number because cancelling is by phone. */
  showPhoneBeforeBooking: true,
} as const;
