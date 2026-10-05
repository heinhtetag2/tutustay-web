"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { useLocale, useT } from "@/i18n/I18nProvider";
import { DELETION_GRACE_DAYS, deletionStore, signIn, type MockSession } from "@/services/auth.service";
import { LocalLink } from "@/shared/components/LocalLink";
import { useStore } from "@/shared/hooks/useStore";
import { Button } from "@/shared/ui/Button";
import { Field, Input, PasswordInput } from "@/shared/ui/Field";
import { StatusBanner } from "@/shared/ui/StatusBanner";

const emailSchema = z.object({ email: z.string().trim().email("err.email"), password: z.string().min(6, "err.password") });
const phoneSchema = z.string().trim().regex(/^\+?[0-9 ()-]{7,20}$/, "err.phone");
const MOCK_OTP = "123456";

/** Only follow `next` if it stays on this site. A path from another locale is re-homed to the current one. */
function safeNext(next: string | null, locale: string): string {
  const fallback = `/${locale}/account/bookings`;
  if (!next || next.startsWith("//")) return fallback;
  const match = next.match(/^\/(en|my|ko)(\/.*)$/);
  return match ? `/${locale}${match[2]}` : fallback;
}

type Tab = "email" | "phone";

export function LoginForm() {
  const t = useT();
  const locale = useLocale();
  const router = useRouter();
  const rawNext = useSearchParams().get("next");
  const next = safeNext(rawNext, locale);
  const pendingDeletion = useStore(deletionStore);
  const [tab, setTab] = useState<Tab>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  const focusFirst = () => setTimeout(() => document.querySelector<HTMLElement>("form [aria-invalid='true']")?.focus(), 0);

  function finish(session: MockSession) {
    deletionStore.set(null); // signing in within the grace period reactivates the account
    signIn(session);
    router.push(next);
  }

  function onEmail(e: FormEvent) {
    e.preventDefault();
    const parsed = emailSchema.safeParse({ email, password });
    if (!parsed.success) {
      const f = parsed.error.flatten().fieldErrors;
      setErrors({ email: f.email?.[0] ? t(f.email[0] as "err.email") : undefined, password: f.password?.[0] ? t(f.password[0] as "err.password") : undefined });
      focusFirst();
      return;
    }
    setErrors({});
    finish({ email: parsed.data.email, method: "email" });
  }

  function onPhone(e: FormEvent) {
    e.preventDefault();
    if (!codeSent) {
      const ok = phoneSchema.safeParse(phone);
      if (!ok.success) { setErrors({ phone: t("err.phone") }); focusFirst(); return; }
      setErrors({});
      setCodeSent(true);
      return;
    }
    if (code.trim() !== MOCK_OTP) { setErrors({ code: t("err.code") }); focusFirst(); return; }
    finish({ phone: phone.trim(), method: "phone" });
  }

  const tabBtn = (x: Tab) => `type-label min-h-11 flex-1 px-4 ${tab === x ? "border-b-2 border-border-focus text-text-brand" : "text-text-secondary"}`;

  return (
    <div className="rounded-card border border-border-subtle bg-surface-raised p-6 md:p-8">
      <h1 className="type-title">{t("auth.title")}</h1>
      {pendingDeletion ? <StatusBanner tone="info" className="mt-4">{t("auth.reactivate", { days: DELETION_GRACE_DAYS })}</StatusBanner> : null}

      <div role="tablist" aria-label={t("auth.title")} className="mt-6 flex border-b border-border-subtle">
        <button role="tab" type="button" aria-selected={tab === "email"} className={tabBtn("email")} onClick={() => { setTab("email"); setErrors({}); }}>{t("auth.tab.email")}</button>
        <button role="tab" type="button" aria-selected={tab === "phone"} className={tabBtn("phone")} onClick={() => { setTab("phone"); setErrors({}); }}>{t("auth.tab.phone")}</button>
      </div>

      {tab === "email" ? (
        <form onSubmit={onEmail} noValidate className="mt-6 flex flex-col gap-4">
          <Field label={t("auth.email")} error={errors.email} required>
            {({ id, describedBy, invalid }) => <Input id={id} type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} aria-describedby={describedBy} invalid={invalid} />}
          </Field>
          <Field label={t("auth.password")} error={errors.password} required>
            {({ id, describedBy, invalid }) => <PasswordInput id={id} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} aria-describedby={describedBy} invalid={invalid} />}
          </Field>
          <Button type="submit" size="lg" fullWidth>{t("auth.submit")}</Button>
          <p className="type-body-sm"><LocalLink href={`/forgot-password${rawNext ? `?next=${encodeURIComponent(rawNext)}` : ""}`} className="text-text-link underline">{t("auth.forgot")}</LocalLink></p>
        </form>
      ) : (
        <form onSubmit={onPhone} noValidate className="mt-6 flex flex-col gap-4">
          <Field label={t("review.phone")} hint={t("auth.phoneHint")} error={errors.phone} required>
            {({ id, describedBy, invalid }) => <Input id={id} type="tel" inputMode="tel" autoComplete="tel" value={phone} disabled={codeSent} onChange={(e) => setPhone(e.target.value)} aria-describedby={describedBy} invalid={invalid} />}
          </Field>
          {codeSent ? (
            <>
              <StatusBanner tone="info" title={t("mock.label")}>{t("auth.codeSent", { code: MOCK_OTP })}</StatusBanner>
              <Field label={t("auth.code")} error={errors.code} required>
                {({ id, describedBy, invalid }) => <Input id={id} inputMode="numeric" autoComplete="one-time-code" value={code} onChange={(e) => setCode(e.target.value)} aria-describedby={describedBy} invalid={invalid} />}
              </Field>
            </>
          ) : null}
          <Button type="submit" size="lg" fullWidth>{codeSent ? t("auth.verify") : t("auth.sendCode")}</Button>
          {codeSent ? <Button variant="ghost" onClick={() => { setCodeSent(false); setCode(""); }}>{t("auth.changeNumber")}</Button> : null}
        </form>
      )}

      <div className="my-6 flex items-center gap-3 text-text-muted" aria-hidden><span className="h-px flex-1 bg-border-subtle" />{t("auth.or")}<span className="h-px flex-1 bg-border-subtle" /></div>
      <div className="flex flex-col gap-3">
        <Button variant="secondary" fullWidth onClick={() => finish({ email: "google.user@example.test", method: "google" })}>{t("auth.google")}</Button>
        <Button variant="secondary" fullWidth onClick={() => finish({ email: "telegram.user@example.test", method: "telegram" })}>{t("auth.telegram")}</Button>
      </div>
      <p className="type-body-sm mt-6 text-text-secondary">{t("auth.noAccount")} <LocalLink href={`/signup${rawNext ? `?next=${encodeURIComponent(rawNext)}` : ""}`} className="text-text-link underline">{t("auth.createAccount")}</LocalLink></p>
      <p className="type-body-sm mt-2 text-text-secondary">{t("auth.age")}</p>
    </div>
  );
}
