import { stayTypesOffered, type Stay } from "@/domain";
import type { Locale } from "@/i18n/config";
import { createT } from "@/i18n/translate";
import { PaymentModeBadge } from "@/shared/components/PaymentModeBadge";
import { Section } from "@/shared/layout/Container";

const PATHS = {
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  key: <><circle cx="8" cy="15" r="4" /><path d="m11 12 8-8M16 7l3 3M14 9l2 2" /></>,
  coffee: <><path d="M6 9h10v7a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3Z" /><path d="M16 11h1.500a2 2 0 0 1 0 4H16M9 3.500c0 1 1 1 1 2M12.500 3.500c0 1 1 1 1 2" /></>,
  hourglass: <><path d="M6 3h12M6 21h12M7 3v3a5 5 0 0 0 2 4l3 2-3 2a5 5 0 0 0-2 4v3M17 3v3a5 5 0 0 1-2 4l-3 2 3 2a5 5 0 0 1 2 4v3" /></>,
  card: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 10h18M7 15h3" /></>,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></>,
  phone: <path d="M5 4h4l2 5-2.500 1.500a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" />,
  cancel: <><circle cx="12" cy="12" r="9" /><path d="m9 9 6 6M15 9l-6 6" /></>,
};
function PIcon({ name }: { name: keyof typeof PATHS }) {
  return <svg aria-hidden viewBox="0 0 24 24" className="mt-0.5 size-4 shrink-0 text-text-primary" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{PATHS[name]}</svg>;
}
const Row = ({ icon, children }: { icon: keyof typeof PATHS; children: React.ReactNode }) => (
  <dd className="type-body-sm flex items-start gap-2.5 text-text-secondary"><PIcon name={icon} />{children}</dd>
);

/** Policies in three short columns (Airbnb pattern) instead of one long list. */
export function StayPolicies({ stay, locale }: { stay: Stay; locale: Locale }) {
  const t = createT(locale);
  const offered = stayTypesOffered(stay.rooms);
  const col = "flex flex-col gap-1";
  const dt = "type-label";
  return (
    <Section divided id="policies" className="pt-6 pb-6 md:pt-8 md:pb-8">
      <h2 className="type-heading mb-6">{t("stay.policies")}</h2>
      <div className="grid gap-8 md:grid-cols-3">
        <dl className={col}>
          <dt className={`${dt} mb-1 text-base`}>{t("policy.checkInOut")}</dt>
          <Row icon="key">{t("policy.times", { in: stay.policies.checkIn, out: stay.policies.checkOut })}</Row>
          <Row icon="coffee">{t(`policy.breakfast.${stay.policies.breakfast}`)}</Row>
          {offered.includes("session") ? <Row icon="hourglass">{t("stayType.session")}: {t("policy.session", { hours: stay.policies.sessionHours.join(" / "), start: stay.policies.sessionStart })}</Row> : null}
        </dl>
        <dl className={col}>
          <dt className={`${dt} mb-1 text-base`}>{t("stay.payment")}</dt>
          <dd className="mb-1"><PaymentModeBadge mode={stay.payment.mode} depositPct={stay.payment.depositPct} /></dd>
          <Row icon="card">{t(stay.payment.mode === "online" ? "policy.pay.deposit" : "policy.pay.cash")}</Row>
        </dl>
        <dl className={col}>
          <dt className={`${dt} mb-1 text-base`}>{t("policy.contact")}</dt>
          <Row icon="phone"><a href={`tel:${stay.phone.replace(/\s/g, "")}`} className="hover:text-text-primary">{stay.phone}</a></Row>
          <Row icon="cancel">{t("policy.cancelByPhone")}</Row>
        </dl>
      </div>
    </Section>
  );
}
