import type { MessageKey } from "./en";

/**
 * Korean. SKELETON ONLY: proves locale routing and font loading. Missing keys fall back to English.
 * Needs a professional translator (docs/04 Q12).
 */
export const ko: Partial<Record<MessageKey, string>> = {
  "nav.stays": "숙소",
  "nav.deals": "특가",
  "nav.help": "도움말",
  "nav.signIn": "로그인",
  "nav.myBookings": "내 예약",
  "home.title": "미얀마 전역에서 숙소를 찾아보세요",
  "search.where": "어디로",
  "search.checkIn": "체크인",
  "search.checkOut": "체크아웃",
  "search.submit": "검색",
  "stayType.overnight": "숙박",
  "stayType.session": "시간제",
  "stayType.daycation": "데이케이션",
  "price.from": "최저가",
  "room.choose": "객실 선택",
};
