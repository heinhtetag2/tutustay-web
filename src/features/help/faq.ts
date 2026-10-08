/**
 * FAQ content. English-only placeholder: moves to a CMS or message catalogue later.
 * Rewritten against the Terms of Service (§04–§06): payment is per stay, cancellation is by phone with the hotel,
 * and the old "deposit is required for every hotel" answer was wrong. Items the product still has to settle are marked.
 */
export interface FaqItem { id: string; topic: "billing" | "booking"; q: string; a: string }

export const FAQ: FaqItem[] = [
  { id: "request", topic: "booking", q: "Is my booking confirmed straight away?", a: "No. A booking is a request. Nothing is held until the hotel accepts it. You can follow it through Pending, Accepted and Confirmed on your booking page." },
  { id: "pay-when", topic: "billing", q: "When and how do I pay?", a: "It depends on the stay, and every stay shows it. Some are Pay at hotel: you settle directly with the property and TuTuStay takes no payment. Others take Online payment through KBZPay: you pay after the hotel accepts, before the deadline shown on your booking." },
  { id: "deadline", topic: "billing", q: "What if I miss the payment deadline?", a: "The booking goes Overdue, your room is still held but at risk, and it is cancelled automatically if the payment doesn't arrive. A payment that arrives after cancellation doesn't bring the booking back. Contact support and we'll return the money." },
  { id: "deposit", topic: "billing", q: "How much do I pay online?", a: "The share paid online varies by hotel and is shown before you send your request. The rest is paid at the property." },
  { id: "fee", topic: "billing", q: "Is there a platform fee?", a: "[Open question for the product team] Any fee is shown in the price breakdown before you send your request." },
  { id: "cancel", topic: "billing", q: "How do I cancel?", a: "While nothing has been paid (Pending, Accepted or Overdue) open your booking and press Cancel booking. Once you have paid, call the hotel's reception: each hotel sets its own cancellation and refund rules, and your booking page shows its number and the rules for your room." },
  { id: "refund", topic: "billing", q: "Will I get a refund?", a: "That follows the hotel's policy for your room. Where a refund is due, we return it to your original payment method. Our team processes refunds, so allow time. If we cancel a booking you already paid for and you weren't at fault, you get a full refund." },
  { id: "receipt", topic: "billing", q: "Can I get a payment receipt?", a: "Yes, from your booking page once an online payment has been made." },
  { id: "dates", topic: "booking", q: "Can I change my dates?", a: "Call the hotel. They will discuss rescheduling and available time slots with you." },
  { id: "someone-else", topic: "booking", q: "Can I book for someone else?", a: "Yes. Tick \"I'm booking for someone else\" and enter the guest's name." },
  { id: "rooms", topic: "booking", q: "Can I book more than one room?", a: "Yes, subject to availability. On the rooms page press Select on each room you want and choose how many of each. Your selection and total are shown on the right." },
  { id: "account", topic: "booking", q: "Do I need an account?", a: "You can search without one. You sign in only when you book, and your selection is kept." },
  { id: "foreigner", topic: "booking", q: "Why are some rates higher for foreign guests?", a: "Rooms with foreign guests may have higher rates due to the property's pricing rules. Choose \"I'm a guest from outside Myanmar\" to see the rate that applies." },
  { id: "session", topic: "booking", q: "What are Session and Daycation stays?", a: "Session is a short stay by the hour and Daycation is a daytime stay. Check-in and check-out times and the available hours are set by each hotel. Not every property offers them." },
  { id: "review", topic: "booking", q: "Who can leave a review?", a: "Only guests with a completed booking. Hotels can reply publicly, and can ask us to hide a review with a stated reason, which we approve or reject." },
  { id: "coupon", topic: "billing", q: "How do coupons work?", a: "Each offer has a validity window, a per-user limit and a total pool, and not every hotel takes part. Coupons have no cash value. If a booking is cancelled, the coupon use is reversed." },
  { id: "receipt-history", topic: "booking", q: "Where can I see my bookings?", a: "In My bookings under your account. It lists upcoming, past and cancelled bookings, and each one shows its current stage." },
  { id: "confirmation", topic: "booking", q: "How will I know my booking is confirmed?", a: "Your booking page shows the stage. The hotel accepts first. For online stays it becomes Confirmed when your payment clears. For pay-at-hotel stays, Accepted means the hotel is holding your room." },
  { id: "how-to-book", topic: "booking", q: "How do I book a stay?", a: "Search, choose a room on the stay page, check the total and how you pay, sign in, and send your request. The hotel then accepts or declines it." },
  { id: "contact-hotel", topic: "booking", q: "How can I contact the hotel?", a: "The stay page and your booking page show the hotel's number. Cancelling or rescheduling is done by phone." },
  { id: "balance", topic: "billing", q: "Can I pay the remaining balance at the hotel?", a: "Yes. For stays that take an online payment, the share paid online is shown before you send your request, and you pay the rest at the property." },
  { id: "refund-how", topic: "billing", q: "How will I receive a refund?", a: "To your original payment method. Our team processes refunds, so allow time for the hotel to confirm the amount and for your provider to post it." },
  { id: "refund-late", topic: "billing", q: "What if my refund hasn't arrived?", a: "Contact support with your booking details and we'll look into it." },
  { id: "near", topic: "booking", q: "How do I find stays near me?", a: "Use \"Stay near you\" in search. We read your location once, only then, and never in the background. You can say no and search by place instead." },
];
