import type { Locale } from "./config";

/**
 * Display names for data values that come from the stay catalogue (facilities, bed types, places).
 * The English value stays the key everywhere else (filters, URLs); only the label shown to the guest changes.
 * Unknown values fall back to the English text. The backend will supply localised names later.
 */
const MY: Record<string, string> = {
  "24 Hour Front Desk": "၂၄ နာရီ ဧည့်ကြိုကောင်တာ",
  "AC": "အဲယားကွန်း",
  "Airport Shuttle": "လေဆိပ်ကားပို့ဆောင်ရေး",
  "Cafe": "ကော်ဖီဆိုင်",
  "Campfire Area": "မီးပုံပွဲနေရာ",
  "Fan": "ပန်ကာ",
  "Spa & Wellness Centre": "စပါနှင့် ကျန်းမာရေးစင်တာ",
  "Swimming Pool": "ရေကူးကန်",
  "Electric kettle": "လျှပ်စစ်ရေနွေးအိုး",
  "Daily Housekeeping": "နေ့စဉ် အခန်းသန့်ရှင်းရေး",
  "Single": "တစ်ဦးအိပ်ခုတင်",
  "Double": "နှစ်ဦးအိပ်ခုတင်",
  "Twin": "ခုတင်နှစ်လုံး",
  "Queen": "ကွင်းဆိုက်ခုတင်",
  "King": "ကင်းဆိုက်ခုတင်",
  "Yangon": "ရန်ကုန်",
  "Bagan": "ပုဂံ",
  "Mandalay": "မန္တလေး",
  "Nyaungshwe": "ညောင်ရွှေ",
  "Pathein": "ပုသိမ်",
  "Thandwe": "သံတွဲ",
  "Chanayethazan": "ချမ်းအေးသာစံ",
  "Hlaing": "လှိုင်",
  "Inle Lake": "အင်းလေးကန်",
  "Insein": "အင်းစိန်",
  "Ngapali": "ငပလီ",
  "Ngwe Saung": "ငွေဆောင်",
  "Nyaung-U": "ညောင်ဦး",
  "Sanchaung": "စမ်းချောင်း",
};

export function dataLabel(locale: Locale | string, text: string): string {
  return locale === "my" ? MY[text] ?? text : text;
}
