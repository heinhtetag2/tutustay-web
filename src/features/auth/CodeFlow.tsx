"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent, type ReactNode } from "react";
import { z } from "zod";
import { useLocale, useT } from "@/i18n/I18nProvider";
import { signIn } from "@/services/auth.service";
import { profileStore } from "@/services/profile.service";
import { LocalLink } from "@/shared/components/LocalLink";
import { NrcField } from "@/shared/components/NrcField";
import { Button } from "@/shared/ui/Button";
import { Checkbox, Field, Input, PasswordInput, Select } from "@/shared/ui/Field";
import { StatusBanner } from "@/shared/ui/StatusBanner";

const MOCK_CODE = "123456";
type Step = 1 | 2 | 3 | 4 | 5; // signup: 4 = your details. reset: 5 = done.
const COUNTRIES = ["MM", "TH", "SG", "CN", "JP", "KR", "IN", "US", "GB", "AU"];
const countryName = (code: string, locale: string) => { try { return new Intl.DisplayNames([locale], { type: "region" }).of(code) ?? code; } catch { return code; } };

/**
 * Sign up and password reset are both 3 steps on the live site ("Step 1 of 3"), with an emailed verification code.
 * Step 1 is observed. Steps 2 and 3 (enter code, then choose a password) are INFERRED from the pattern and the Terms (§03).
 * MOCK: no email is sent. The code is shown on screen.
 */
export function CodeFlow({ kind }: { kind: "signup" | "reset" }) {
  const t = useT();
  const locale = useLocale();
  const router = useRouter();
  const rawNext = useSearchParams().get("next");
  const [step, setStep] = useState<Step>(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("MM");
  const [nrc, setNrc] = useState("");
  const [address, setAddress] = useState("");
  const [age, setAge] = useState(false);
  const [terms, setTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  const focus = () => setTimeout(() => document.querySelector<HTMLElement>("form [aria-invalid='true']")?.focus(), 0);
  const fail = (e: Record<string, string>) => { setErrors(e); focus(); };
  const clear = (k: string) => setErrors((e) => ({ ...e, [k]: undefined }));
  const total = kind === "signup" ? 4 : 3;
  const title = kind === "signup" ? t("signup.title") : t("forgot.title");

  function submit(e: FormEvent) {
    e.preventDefault();
    if (step === 1) {
      if (!z.string().trim().email().safeParse(email).success) return fail({ email: t("err.email") });
      setErrors({}); setStep(2); return;
    }
    if (step === 2) {
      if (code.trim() !== MOCK_CODE) return fail({ code: t("err.code") });
      setErrors({}); setStep(3); return;
    }
    if (step === 3) {
      const bad: Record<string, string> = {};
      if (pw.length < 6) bad.pw = t("err.password");
      else if (pw !== pw2) bad.pw2 = t("err.passwordMatch");
      if (Object.keys(bad).length) return fail(bad);
      setErrors({});
      setStep(kind === "signup" ? 4 : 5);
      return;
    }
    // Signup step 4: who is booking. Name, phone and nationality are required; ID number and address can wait until check-in.
    const bad: Record<string, string> = {};
    if (name.trim().length < 2) bad.name = t("err.yourName");
    if (!/^\+?[0-9 ()-]{7,20}$/.test(phone.trim())) bad.phone = t("err.phone");
    if (!age) bad.age = t("err.age");
    if (!terms) bad.terms = t("err.terms");
    if (Object.keys(bad).length) return fail(bad);
    profileStore.set({ name: name.trim(), phone: phone.trim(), country, nrc: nrc.trim(), address: address.trim() });
    signIn({ email: email.trim(), method: "email" });
    const m = rawNext?.match(/^\/(en|my|ko)(\/.*)$/);
    router.push(m && !rawNext?.startsWith("//") ? `/${locale}${m[2]}` : `/${locale}/account`);
  }

  const next = rawNext ? `?next=${encodeURIComponent(rawNext)}` : "";
  const stepLabel: Record<number, string> = {
    1: kind === "signup" ? t("signup.step1") : t("forgot.step1"),
    2: t("flow.step2"),
    3: t("flow.step3"),
    4: t("flow.step4"),
  };

  let body: ReactNode;
  if (step === 5) {
    body = (
      <div className="flex flex-col gap-4">
        <StatusBanner tone="success" title={t("forgot.doneTitle")}>{t("forgot.doneBody")}</StatusBanner>
        <LocalLink href="/login" className="type-label text-text-link">{t("forgot.back")}</LocalLink>
      </div>
    );
  } else {
    body = (
      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        <p className="type-body-sm text-text-secondary" aria-live="polite">{t("flow.stepOf", { n: step, total })} · {stepLabel[step]}</p>
        {step === 1 ? (
          <>
            <p className="type-body text-text-secondary">{kind === "signup" ? t("signup.intro") : t("forgot.intro")}</p>
            <Field label={t("auth.email")} hint={t("flow.emailHint")} error={errors.email} required>
              {({ id, describedBy, invalid }) => <Input id={id} type="email" autoComplete="email" value={email} onChange={(e) => { setEmail(e.target.value); clear("email"); }} aria-describedby={describedBy} invalid={invalid} />}
            </Field>
            <Button type="submit" size="lg" fullWidth>{t("flow.sendCode")}</Button>
          </>
        ) : null}
        {step === 2 ? (
          <>
            <StatusBanner tone="info" title={t("mock.label")}>{t("flow.codeMock", { email, code: MOCK_CODE })}</StatusBanner>
            <Field label={t("auth.code")} error={errors.code} required>
              {({ id, describedBy, invalid }) => <Input id={id} inputMode="numeric" autoComplete="one-time-code" value={code} onChange={(e) => { setCode(e.target.value); clear("code"); }} aria-describedby={describedBy} invalid={invalid} />}
            </Field>
            <Button type="submit" size="lg" fullWidth>{t("auth.verify")}</Button>
            <Button variant="ghost" onClick={() => { setStep(1); setCode(""); }}>{t("flow.changeEmail")}</Button>
          </>
        ) : null}
        {step === 3 ? (
          <>
            <Field label={kind === "signup" ? t("auth.password") : t("flow.newPassword")} hint={t("register.passwordHint")} error={errors.pw} required>
              {({ id, describedBy, invalid }) => <PasswordInput id={id} autoComplete="new-password" value={pw} onChange={(e) => { setPw(e.target.value); clear("pw"); }} aria-describedby={describedBy} invalid={invalid} />}
            </Field>
            <Field label={t("flow.confirmPassword")} error={errors.pw2} required>
              {({ id, describedBy, invalid }) => <PasswordInput id={id} autoComplete="new-password" value={pw2} onChange={(e) => { setPw2(e.target.value); clear("pw2"); }} aria-describedby={describedBy} invalid={invalid} />}
            </Field>
            <Button type="submit" size="lg" fullWidth>{kind === "signup" ? t("flow.continue") : t("forgot.save")}</Button>
          </>
        ) : null}
        {step === 4 ? (
          <>
            <Field label={t("profile.name")} error={errors.name} required>
              {({ id, describedBy, invalid }) => <Input id={id} autoComplete="name" value={name} onChange={(e) => { setName(e.target.value); clear("name"); }} aria-describedby={describedBy} invalid={invalid} />}
            </Field>
            <Field label={t("profile.phone")} error={errors.phone} required>
              {({ id, describedBy, invalid }) => <Input id={id} type="tel" inputMode="tel" autoComplete="tel" value={phone} onChange={(e) => { setPhone(e.target.value); clear("phone"); }} aria-describedby={describedBy} invalid={invalid} />}
            </Field>
            <Field label={t("profile.nationality")} required>
              {({ id }) => (
                <Select id={id} value={country} onChange={(e) => { setCountry(e.target.value); setNrc(""); }}>
                  {COUNTRIES.map((c) => <option key={c} value={c}>{countryName(c, locale)}</option>)}
                </Select>
              )}
            </Field>
            {country === "MM" ? (
              <NrcField label={t("profile.nrc")} hint={t("flow.optionalHint")} value={nrc} onChange={setNrc} />
            ) : (
              <Field label={t("profile.passport")} hint={t("flow.optionalHint")}>
                {({ id, describedBy }) => <Input id={id} autoComplete="off" value={nrc} onChange={(e) => setNrc(e.target.value)} aria-describedby={describedBy} />}
              </Field>
            )}
            <Field label={t("profile.address")} hint={t("flow.optionalHint")}>
              {({ id, describedBy }) => <Input id={id} autoComplete="street-address" value={address} onChange={(e) => setAddress(e.target.value)} aria-describedby={describedBy} />}
            </Field>
            <Checkbox label={t("register.age")} checked={age} onChange={(e) => { setAge(e.target.checked); clear("age"); }} error={errors.age} />
            <Checkbox label={<>{t("register.terms")} <LocalLink href="/legal/terms" className="text-text-link underline">{t("legal.termsFull")}</LocalLink> {t("flow.and")} <LocalLink href="/legal/privacy" className="text-text-link underline">{t("legal.privacyFull")}</LocalLink></>} checked={terms} onChange={(e) => { setTerms(e.target.checked); clear("terms"); }} error={errors.terms} />
            <Button type="submit" size="lg" fullWidth>{t("register.submit")}</Button>
          </>
        ) : null}
      </form>
    );
  }

  return (
    <div className="rounded-sheet border border-border-subtle bg-surface-raised p-6 shadow-high md:p-8">
      <h1 className="type-title">{title}</h1>
      <div className="mt-6">{body}</div>
      {step !== 5 ? (
        <p className="type-body-sm mt-6 text-text-secondary">
          {kind === "signup" ? t("register.have") : t("forgot.remembered")} <LocalLink href={`/login${next}`} className="text-text-link underline">{t("auth.submit")}</LocalLink>
        </p>
      ) : null}
    </div>
  );
}
