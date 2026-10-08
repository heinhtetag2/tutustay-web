"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useT } from "@/i18n/I18nProvider";
import { Button, LinkButton } from "@/shared/ui/Button";
import { Field, Input, Select } from "@/shared/ui/Field";
import { StatusBanner } from "@/shared/ui/StatusBanner";
import { BUSINESS_TYPES, COUNTRIES, MAX_FILES, partnerSchema, validateFiles } from "@/validation/partner";

type Errors = Record<string, string | undefined>;
const STORAGE_KEY = "tutustay.partnerApplication";
interface Saved { ref: string; at: string; data: Record<string, string>; files: string[] }

const CODES = [["+95", "MM"], ["+66", "TH"], ["+65", "SG"], ["+60", "MY"], ["+84", "VN"], ["+856", "LA"], ["+855", "KH"], ["+86", "CN"], ["+91", "IN"], ["+81", "JP"], ["+82", "KR"], ["+1", "US"]] as const;

const DEMO: Record<string, string> = {
  businessName: "Ngapali Palm Resort", businessType: BUSINESS_TYPES[0], website: "https://example.com/ngapali-palm",
  firstName: "Aye", lastName: "Mon", email: "aye.mon@example.com", phoneCode: "+95", phone: "9123456789",
  street: "12 Beach Road", unit: "Building B", city: "Thandwe", region: "Rakhine", country: "MM", postal: "07001",
};

/** MOCK submit: nothing is sent anywhere. Validation, helper text and states are the real UX. */
export function PartnerApplicationForm() {
  const t = useT();
  const [errors, setErrors] = useState<Errors>({});
  const [saved, setSaved] = useState<Saved | null>(null);
  const [ready, setReady] = useState(false);
  const [sending, setSending] = useState(false);
  const [fileNames, setFileNames] = useState<string[]>([]);
  const formRef = useRef<HTMLFormElement>(null);

  // MOCK: the application is kept in this browser only, so it can be looked at again after a refresh.
  useEffect(() => {
    try { const raw = localStorage.getItem(STORAGE_KEY); if (raw) setSaved(JSON.parse(raw) as Saved); } catch { /* storage blocked: start with an empty form */ }
    setReady(true);
  }, []);
  const [sel, setSel] = useState({ businessType: "", phoneCode: "+95", country: "MM" });
  const pick = (name: keyof typeof sel) => ({ value: sel[name], onChange: (e: { target: { value: string } }) => setSel((x) => ({ ...x, [name]: e.target.value })) });

  /** Demo helper: fills every field with sample details so the whole flow can be tried without typing. */
  function fillDemo() {
    const form = formRef.current;
    if (!form) return;
    for (const [name, value] of Object.entries(DEMO)) {
      const el = form.elements.namedItem(name);
      if (el instanceof HTMLInputElement && !(name in sel)) el.value = value;
    }
    setSel({ businessType: DEMO.businessType!, phoneCode: DEMO.phoneCode!, country: DEMO.country! });
    setErrors({});
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;
    const files = Array.from(form.querySelector<HTMLInputElement>("input[type=file]")?.files ?? []);
    const next: Errors = {};
    const parsed = partnerSchema.safeParse(data);
    if (!parsed.success) for (const i of parsed.error.issues) { const k = String(i.path[0]); if (!next[k]) next[k] = t(i.message as "err.email"); }
    const fileErr = validateFiles(files);
    if (fileErr) next.files = t(fileErr, { n: MAX_FILES });
    setErrors(next);
    if (Object.keys(next).length) {
      setTimeout(() => document.querySelector<HTMLElement>("form [aria-invalid='true']")?.focus(), 0);
      return;
    }
    setSending(true);
    const record: Saved = { ref: `PA-${Math.random().toString(36).slice(2, 8).toUpperCase()}`, at: new Date().toISOString(), data, files: fileNames };
    setTimeout(() => {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(record)); } catch { /* storage blocked: the summary still shows this time */ }
      setSending(false); setSaved(record); window.scrollTo({ top: 0 });
    }, 600); // simulated latency
  }

  if (!ready) return null;

  if (saved) {
    const d = saved.data;
    const details: [string, string | undefined][] = [
      [t("partner.businessName"), d.businessName],
      [t("partner.businessType"), d.businessType ? t(`partner.type.${d.businessType}` as "partner.type.hotel") : undefined],
      [t("partner.website"), d.website],
      [t("partner.sec.contact"), [d.firstName, d.lastName].filter(Boolean).join(" ")],
      [t("review.email"), d.email],
      [t("review.phone"), [d.phoneCode, d.phone].filter(Boolean).join(" ")],
      [t("partner.sec.where"), [d.street, d.unit, d.city, d.region, d.postal].filter(Boolean).join(", ")],
      [t("partner.files"), saved.files.length ? saved.files.join(", ") : undefined],
    ];
    const stages = [t("partner.stage.received"), t("partner.stage.review"), t("partner.stage.decision")];
    return (
      <div className="flex flex-col gap-6 rounded-card border border-border-subtle bg-surface-raised p-6">
        <StatusBanner tone="success" title={t("partner.done.title")}>{t("partner.done.body")}</StatusBanner>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="type-label">{t("partner.ref")}: <span className="font-mono">{saved.ref}</span></p>
          <p className="type-body-sm text-text-secondary">{new Date(saved.at).toLocaleString()}</p>
        </div>
        <ol className="grid grid-cols-3 gap-2" aria-label={t("partner.status")}>
          {stages.map((label, i) => (
            <li key={label} className="flex flex-col gap-2">
              <span aria-hidden className={`h-1.5 rounded-full ${i <= 1 ? "bg-action-cta" : "bg-border-subtle"}`} />
              <span className={`type-body-sm ${i === 1 ? "font-semibold" : i < 1 ? "" : "text-text-secondary"}`}>{label}{i === 1 ? ` · ${t("partner.stage.now")}` : ""}</span>
            </li>
          ))}
        </ol>
        <dl className="divide-y divide-border-subtle rounded-field border border-border-subtle">
          {details.filter(([, v]) => v).map(([k, v]) => (
            <div key={k} className="grid gap-1 px-4 py-3 sm:grid-cols-[10rem_1fr] sm:gap-4">
              <dt className="type-body-sm text-text-secondary">{k}</dt>
              <dd className="type-body-sm break-words">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="flex flex-wrap gap-3">
          <LinkButton href="/partners" variant="secondary">{t("partner.done.back")}</LinkButton>
          <Button type="button" variant="secondary" onClick={() => { try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ } setSaved(null); setFileNames([]); setErrors({}); }}>{t("partner.startNew")}</Button>
        </div>
      </div>
    );
  }

  const row = "grid gap-4 sm:grid-cols-2";
  const fieldProps = (name: string) => ({ name, "aria-invalid": errors[name] ? (true as const) : undefined });

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="flex flex-col gap-8" onInput={(e) => { const n = (e.target as HTMLInputElement).name; if (n && errors[n]) setErrors((x) => ({ ...x, [n]: undefined })); }}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="type-body-sm text-text-secondary">{t("partner.form.intro")}</p>
        <Button type="button" variant="secondary" onClick={fillDemo}>{t("partner.fillDemo")}</Button>
      </div>

      <fieldset className="flex flex-col gap-4">
        <legend className="type-heading mb-2">{t("partner.sec.business")}</legend>
        <Field label={t("partner.businessName")} error={errors.businessName} required>
          {({ id, describedBy }) => <Input id={id} {...fieldProps("businessName")} aria-describedby={describedBy} invalid={Boolean(errors.businessName)} />}
        </Field>
        <Field label={t("partner.businessType")} hint={t("partner.businessTypeHint")} error={errors.businessType} required>
          {({ id, describedBy }) => (
            <Select id={id} {...fieldProps("businessType")} aria-describedby={describedBy} invalid={Boolean(errors.businessType)} {...pick("businessType")}>
              <option value="" disabled>{t("partner.choose")}</option>
              {BUSINESS_TYPES.map((b) => <option key={b} value={b}>{t(`partner.type.${b}`)}</option>)}
            </Select>
          )}
        </Field>
        <Field label={t("partner.website")} hint={t("partner.optional")} error={errors.website}>
          {({ id, describedBy }) => <Input id={id} type="url" {...fieldProps("website")} aria-describedby={describedBy} invalid={Boolean(errors.website)} placeholder="https://" />}
        </Field>
      </fieldset>

      <fieldset className="flex flex-col gap-4">
        <legend className="type-heading mb-2">{t("partner.sec.contact")}</legend>
        <div className={row}>
          <Field label={t("partner.firstName")} error={errors.firstName} required>{({ id, describedBy }) => <Input id={id} autoComplete="given-name" {...fieldProps("firstName")} aria-describedby={describedBy} invalid={Boolean(errors.firstName)} />}</Field>
          <Field label={t("partner.lastName")} error={errors.lastName} required>{({ id, describedBy }) => <Input id={id} autoComplete="family-name" {...fieldProps("lastName")} aria-describedby={describedBy} invalid={Boolean(errors.lastName)} />}</Field>
        </div>
        <Field label={t("review.email")} error={errors.email} required>{({ id, describedBy }) => <Input id={id} type="email" autoComplete="email" {...fieldProps("email")} aria-describedby={describedBy} invalid={Boolean(errors.email)} />}</Field>
        <div className="grid grid-cols-[7rem_1fr] gap-4">
          <Field label={t("partner.code")} error={errors.phoneCode}>{({ id, describedBy }) => (
            <Select id={id} {...fieldProps("phoneCode")} aria-describedby={describedBy} invalid={Boolean(errors.phoneCode)} {...pick("phoneCode")}>
              {CODES.map(([code, c]) => <option key={code} value={code}>{code} {t(`country.${c}`)}</option>)}
            </Select>
          )}</Field>
          <Field label={t("review.phone")} hint={t("partner.phoneHint")} error={errors.phone} required>{({ id, describedBy }) => <Input id={id} type="tel" autoComplete="tel-national" {...fieldProps("phone")} aria-describedby={describedBy} invalid={Boolean(errors.phone)} />}</Field>
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-4">
        <legend className="type-heading mb-2">{t("partner.sec.where")}</legend>
        <Field label={t("partner.street")} error={errors.street} required>{({ id, describedBy }) => <Input id={id} autoComplete="street-address" {...fieldProps("street")} aria-describedby={describedBy} invalid={Boolean(errors.street)} />}</Field>
        <Field label={t("partner.unit")} hint={t("partner.optional")}>{({ id }) => <Input id={id} name="unit" />}</Field>
        <div className={row}>
          <Field label={t("partner.city")} error={errors.city} required>{({ id, describedBy }) => <Input id={id} autoComplete="address-level2" {...fieldProps("city")} aria-describedby={describedBy} invalid={Boolean(errors.city)} />}</Field>
          <Field label={t("partner.region")} hint={t("partner.optional")}>{({ id }) => <Input id={id} name="region" />}</Field>
        </div>
        <div className={row}>
          <Field label={t("partner.country")} error={errors.country} required>
            {({ id, describedBy }) => (
              <Select id={id} {...fieldProps("country")} aria-describedby={describedBy} invalid={Boolean(errors.country)} {...pick("country")}>
                {COUNTRIES.map((c) => <option key={c} value={c}>{t(`country.${c}`)}</option>)}
              </Select>
            )}
          </Field>
          <Field label={t("partner.postal")} hint={t("partner.optional")}>{({ id }) => <Input id={id} name="postal" autoComplete="postal-code" />}</Field>
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className="type-heading mb-2">{t("partner.sec.docs")}</legend>
        <Field label={t("partner.files")} hint={t("partner.filesHint", { n: MAX_FILES })} error={errors.files}>
          {({ id, describedBy }) => (
            <input
              id={id} type="file" multiple accept="application/pdf,image/*" aria-describedby={describedBy} aria-invalid={errors.files ? true : undefined}
              onChange={(e) => setFileNames(Array.from(e.target.files ?? []).map((f) => f.name))}
              className="type-body-sm min-h-11 w-full rounded-field border border-border-control bg-surface-raised p-2"
            />
          )}
        </Field>
        {fileNames.length ? <ul className="type-body-sm list-disc pl-5 text-text-secondary">{fileNames.map((n) => <li key={n}>{n}</li>)}</ul> : null}
        <p className="type-body-sm text-text-secondary">{t("partner.filesLater")}</p>
      </fieldset>

      <div className="flex flex-col gap-3">
        <Button type="submit" size="lg" loading={sending} className="self-start">{t("partner.submit")}</Button>
        <p className="type-body-sm text-text-secondary">{t("partner.reply")}</p>
      </div>
    </form>
  );
}
