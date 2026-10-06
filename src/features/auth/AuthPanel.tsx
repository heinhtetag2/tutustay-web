"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent, type ReactNode } from "react";
import { z } from "zod";
import { useLocale, useT } from "@/i18n/I18nProvider";
import { DELETION_GRACE_DAYS, deletionStore, signIn, type MockSession } from "@/services/auth.service";
import { LocalLink } from "@/shared/components/LocalLink";
import { useStore } from "@/shared/hooks/useStore";
import { Button } from "@/shared/ui/Button";
import { Field, Input, PasswordInput } from "@/shared/ui/Field";
import { StatusBanner } from "@/shared/ui/StatusBanner";

const emailSchema = z.string().trim().email();
const passwordSchema = z.string().min(6);
const phoneSchema = z.string().trim().regex(/^\+?[0-9 ()-]{7,20}$/);
const MOCK_OTP = "123456";

type Step = "start" | "password" | "phone";

const ICON_GOOGLE = <svg aria-hidden viewBox="0 0 24 24" className="size-6"><path fill="#4285F4" d="M22.560 12.250c0-.780-.070-1.530-.200-2.250H12v4.260h5.920a5.060 5.060 0 0 1-2.200 3.320v2.770h3.560c2.080-1.920 3.280-4.740 3.280-8.100Z" /><path fill="#34A853" d="M12 23c2.970 0 5.460-.980 7.280-2.660l-3.560-2.770c-.980.660-2.230 1.060-3.720 1.060-2.860 0-5.290-1.930-6.160-4.530H2.180v2.840A11 11 0 0 0 12 23Z" /><path fill="#FBBC05" d="M5.840 14.100a6.600 6.600 0 0 1 0-4.200V7.070H2.180a11 11 0 0 0 0 9.860l3.660-2.830Z" /><path fill="#EA4335" d="M12 5.380c1.620 0 3.060.560 4.210 1.640l3.150-3.150C17.450 2.090 14.970 1 12 1A11 11 0 0 0 2.180 7.070l3.660 2.830C6.710 7.310 9.140 5.380 12 5.380Z" /></svg>;
const ICON_TELEGRAM = <svg aria-hidden viewBox="0 0 24 24" className="size-6"><circle cx="12" cy="12" r="11" fill="#27A7E7" /><path fill="#fff" d="m5.500 11.800 11.100-4.300c.510-.190.960.130.790.920l-1.890 8.900c-.140.630-.510.780-1.040.490l-2.880-2.130-1.390 1.340c-.150.150-.280.280-.580.280l.210-2.940 5.350-4.830c.230-.210-.050-.320-.360-.120l-6.610 4.160-2.850-.890c-.620-.190-.630-.620.130-.920Z" /></svg>;
const ICON_PHONE = <svg aria-hidden viewBox="0 0 24 24" className="size-6 text-text-primary" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="7" y="3" width="10" height="18" rx="2.500" /><path d="M11 18h2" /></svg>;

function ProviderRow({ icon, label, onClick }: { icon: ReactNode; label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="type-label flex min-h-14 w-full cursor-pointer items-center gap-4 rounded-field border border-border-control bg-surface-raised px-4 text-left transition-colors hover:bg-surface-subtle">
      {icon}
      <span className="flex-1">{label}</span>
    </button>
  );
}

/**
 * Sign in or create an account, in steps: pick Google, Telegram or phone, or enter an email and press Next (then the password).
 * Used both in the dialog opened from anywhere and on the /login page. MOCK: any valid email with a 6+ character password works.
 */
export function AuthPanel({ next, onDone, onNavigate, heading = "h1" }: { next?: string; onDone?: () => void; onNavigate?: () => void; heading?: "h1" | "h2" }) {
  const t = useT();
  const locale = useLocale();
  const router = useRouter();
  const pendingDeletion = useStore(deletionStore);
  const [step, setStep] = useState<Step>("start");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  const focusFirst = () => setTimeout(() => document.querySelector<HTMLElement>("dialog[open] [aria-invalid='true'], form [aria-invalid='true']")?.focus(), 0);
  const nextQuery = next ? `?next=${encodeURIComponent(next)}` : "";
  const Heading = heading;

  function finish(session: MockSession) {
    deletionStore.set(null); // signing in within the grace period reactivates the account
    signIn(session);
    if (onDone) onDone(); else router.push(next ?? `/${locale}/account`);
  }

  function onEmailNext(e: FormEvent) {
    e.preventDefault();
    if (!emailSchema.safeParse(email).success) { setErrors({ email: t("err.email") }); focusFirst(); return; }
    setErrors({});
    setStep("password");
  }

  function onPassword(e: FormEvent) {
    e.preventDefault();
    if (!passwordSchema.safeParse(password).success) { setErrors({ password: t("err.password") }); focusFirst(); return; }
    finish({ email: email.trim(), method: "email" });
  }

  function onPhone(e: FormEvent) {
    e.preventDefault();
    if (!codeSent) {
      if (!phoneSchema.safeParse(phone).success) { setErrors({ phone: t("err.phone") }); focusFirst(); return; }
      setErrors({});
      setCodeSent(true);
      return;
    }
    if (code.trim() !== MOCK_OTP) { setErrors({ code: t("err.code") }); focusFirst(); return; }
    finish({ phone: phone.trim(), method: "phone" });
  }

  const back = (to: Step) => (
    <button type="button" onClick={() => { setStep(to); setErrors({}); setCodeSent(false); setCode(""); }} className="type-label -ml-2 mb-3 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full px-2 pr-4 text-text-secondary hover:bg-surface-subtle hover:text-text-primary">
      <svg aria-hidden viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7" /></svg>
      {t("common.back")}
    </button>
  );

  return (
    <div>
      {step === "password" ? back("start") : step === "phone" ? back("start") : null}
      <Heading className="type-title">{t("auth.dialogTitle")}</Heading>
      <p className="type-body mt-2 text-text-secondary">{t("auth.tagline")}</p>
      {pendingDeletion ? <StatusBanner tone="info" className="mt-4">{t("auth.reactivate", { days: DELETION_GRACE_DAYS })}</StatusBanner> : null}

      {step === "start" ? (
        <div className="mt-6 flex flex-col gap-3">
          <ProviderRow icon={ICON_GOOGLE} label={t("auth.google")} onClick={() => finish({ email: "google.user@example.test", method: "google" })} />
          <ProviderRow icon={ICON_TELEGRAM} label={t("auth.telegram")} onClick={() => finish({ email: "telegram.user@example.test", method: "telegram" })} />
          <ProviderRow icon={ICON_PHONE} label={t("auth.continuePhone")} onClick={() => { setStep("phone"); setErrors({}); }} />

          <h2 className="type-subheading mt-4">{t("auth.useEmail")}</h2>
          <form onSubmit={onEmailNext} noValidate className="flex flex-col gap-4">
            <Field label={t("auth.email")} error={errors.email}>
              {({ id, describedBy, invalid }) => <Input id={id} type="email" autoComplete="email" placeholder={t("auth.email")} value={email} onChange={(e) => setEmail(e.target.value)} aria-describedby={describedBy} invalid={invalid} className="min-h-12" />}
            </Field>
            <Button type="submit" size="lg" fullWidth className="!rounded-field">{t("auth.next")}</Button>
          </form>
          <p className="type-body-sm text-text-secondary">{t("auth.noAccount")} <LocalLink href={`/signup${nextQuery}`} onClick={onNavigate} className="text-text-link underline">{t("auth.createAccount")}</LocalLink></p>
        </div>
      ) : null}

      {step === "password" ? (
        <form onSubmit={onPassword} noValidate className="mt-6 flex flex-col gap-4">
          <p className="type-label rounded-field bg-surface-subtle px-4 py-3">{email}</p>
          <Field label={t("auth.password")} error={errors.password} required>
            {({ id, describedBy, invalid }) => <PasswordInput id={id} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} aria-describedby={describedBy} invalid={invalid} autoFocus />}
          </Field>
          <Button type="submit" size="lg" fullWidth className="!rounded-field">{t("auth.submit")}</Button>
          <p className="type-body-sm"><LocalLink href={`/forgot-password${nextQuery}`} onClick={onNavigate} className="text-text-link underline">{t("auth.forgot")}</LocalLink></p>
        </form>
      ) : null}

      {step === "phone" ? (
        <form onSubmit={onPhone} noValidate className="mt-6 flex flex-col gap-4">
          <Field label={t("review.phone")} hint={t("auth.phoneHint")} error={errors.phone} required>
            {({ id, describedBy, invalid }) => <Input id={id} type="tel" inputMode="tel" autoComplete="tel" value={phone} disabled={codeSent} onChange={(e) => setPhone(e.target.value)} aria-describedby={describedBy} invalid={invalid} className="min-h-12" />}
          </Field>
          {codeSent ? (
            <>
              <StatusBanner tone="info" title={t("mock.label")}>{t("auth.codeSent", { code: MOCK_OTP })}</StatusBanner>
              <Field label={t("auth.code")} error={errors.code} required>
                {({ id, describedBy, invalid }) => <Input id={id} inputMode="numeric" autoComplete="one-time-code" value={code} onChange={(e) => setCode(e.target.value)} aria-describedby={describedBy} invalid={invalid} className="min-h-12" />}
              </Field>
            </>
          ) : null}
          <Button type="submit" size="lg" fullWidth className="!rounded-field">{codeSent ? t("auth.verify") : t("auth.sendCode")}</Button>
          {codeSent ? <Button variant="ghost" onClick={() => { setCodeSent(false); setCode(""); }}>{t("auth.changeNumber")}</Button> : null}
        </form>
      ) : null}

      <p className="type-body-sm mt-6 text-text-secondary">{t("auth.age")}</p>
    </div>
  );
}
