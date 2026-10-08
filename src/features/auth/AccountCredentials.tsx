"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useT } from "@/i18n/I18nProvider";
import { changeEmail, sessionLabel, type MockSession } from "@/services/auth.service";
import { Button } from "@/shared/ui/Button";
import { Field, Input } from "@/shared/ui/Field";
import { StatusBanner } from "@/shared/ui/StatusBanner";

const SYMBOLS = "#?!@$%^&*-";
const MOCK_CODE = "123456";

/** The "enter the code we sent you" step that guards an email or password change. MOCK: the code is shown on screen and nothing is sent. */
function CodeStep({ sentTo, confirmLabel, onVerified, onBack }: { sentTo: string; confirmLabel: string; onVerified: () => void; onBack: () => void }) {
  const t = useT();
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  const [wait, setWait] = useState(30);
  const [resent, setResent] = useState(false);
  useEffect(() => {
    if (wait <= 0) return;
    const id = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(id);
  }, [wait]);
  const verify = () => { if (code.trim() === MOCK_CODE) onVerified(); else setError(true); };
  return (
    <form className="mt-4 flex max-w-md flex-col gap-3" onSubmit={(e) => { e.preventDefault(); verify(); }}>
      <p className="type-label">{t("verify.title")}</p>
      <p className="type-body-sm text-text-secondary">{t("verify.sent", { to: sentTo })}</p>
      <StatusBanner tone="info" title={t("mock.label")}>{t("flow.codeMock", { email: sentTo, code: MOCK_CODE })}</StatusBanner>
      <Field label={t("auth.code")} error={error ? t("err.code") : undefined} required>
        {({ id, describedBy, invalid }) => (
          <Input id={id} inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} aria-describedby={describedBy} invalid={invalid} className="tracking-[0.4em]" onChange={(e) => { setError(false); setCode(e.target.value.replace(/\D/g, "")); }} />
        )}
      </Field>
      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" variant="ghost" disabled={wait > 0} onClick={() => { setWait(30); setResent(true); }}>{wait > 0 ? t("verify.resendIn", { s: wait }) : t("verify.resend")}</Button>
        {resent && wait > 0 ? <span role="status" className="type-body-sm text-text-secondary">{t("verify.resent")}</span> : null}
      </div>
      <div className="flex gap-3"><Button type="submit" disabled={code.length !== 6}>{confirmLabel}</Button><Button variant="secondary" onClick={onBack}>{t("verify.back")}</Button></div>
    </form>
  );
}

/** The password rules, one by one, so the list can show which are already met. */
export function passwordChecks(pw: string) {
  return {
    length: pw.length >= 8 && pw.length <= 20,
    letter: /[A-Za-z]/.test(pw),
    number: /[0-9]/.test(pw),
    symbol: [...SYMBOLS].some((c) => pw.includes(c)),
    plain: pw.length > 0 && /^[\x21-\x7e]+$/.test(pw),
  };
}

const eye = (off: boolean) => (
  <svg aria-hidden viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.500 12S6 5.500 12 5.500 21.500 12 21.500 12 18 18.500 12 18.500 2.500 12 2.500 12Z" /><circle cx="12" cy="12" r="3" />
    {off ? <path d="m4 4 16 16" /> : null}
  </svg>
);

function PasswordInput({ id, value, onChange, describedBy, invalid, autoComplete }: { id: string; value: string; onChange: (v: string) => void; describedBy?: string; invalid: boolean; autoComplete: string }) {
  const t = useT();
  const [shown, setShown] = useState(false);
  return (
    <div className="relative">
      <Input id={id} type={shown ? "text" : "password"} value={value} autoComplete={autoComplete} aria-describedby={describedBy} invalid={invalid} onChange={(e) => onChange(e.target.value)} className="pr-12" />
      <button type="button" aria-label={t(shown ? "pw.hide" : "pw.show")} aria-pressed={shown} onClick={() => setShown((s) => !s)} className="absolute right-1 top-1/2 inline-flex size-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-text-secondary hover:bg-surface-subtle">{eye(!shown)}</button>
    </div>
  );
}

function Row({ label, value, action, children }: { label: string; value?: string; action?: ReactNode; children?: ReactNode }) {
  return (
    <div className="py-4 first:pt-0 last:pb-0">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0"><p className="type-label">{label}</p>{value ? <p className="type-body-sm truncate text-text-secondary">{value}</p> : null}</div>
        {action}
      </div>
      {children}
    </div>
  );
}

/** Sign-in details: the email, and the password with the same rules and strength meter as the app. Mock: nothing is sent or stored. */
export function AccountCredentials({ session }: { session: MockSession }) {
  const t = useT();
  const [mode, setMode] = useState<"email" | "password" | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [done, setDone] = useState<"email" | "password" | null>(null);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [errors, setErrors] = useState<{ old?: string; confirm?: string; rules?: string }>({});
  const hasPassword = session.method === "email" || session.method === "phone";
  const checks = passwordChecks(newPw);
  const met = Object.values(checks).filter(Boolean).length;
  const strength = newPw.length === 0 ? 0 : met <= 3 ? 1 : met === 4 ? 2 : 3;
  const bar = ["bg-error-text", "bg-warning-text", "bg-success-text"][strength - 1];

  const close = () => { setVerifying(false); setMode(null); setErrors({}); setEmailError(false); setOldPw(""); setNewPw(""); setConfirmPw(""); setEmail(""); };

  const startEmail = () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setEmailError(true); return; }
    setVerifying(true);
  };
  const saveEmail = () => {
    changeEmail(email.trim());
    close(); setDone("email");
  };
  const savePassword = () => {
    const next: typeof errors = {};
    if (!oldPw) next.old = t("pw.err.old");
    if (!Object.values(checks).every(Boolean)) next.rules = t("pw.err.rules");
    if (newPw !== confirmPw) next.confirm = t("pw.err.match");
    setErrors(next);
    if (Object.keys(next).length) return;
    setVerifying(true);
  };

  const ruleLine = (ok: boolean, text: string) => (
    <li className={`flex items-start gap-2 ${ok ? "text-success-text" : "text-text-secondary"}`}>
      <span aria-hidden className="mt-0.5 shrink-0">{ok ? "✓" : "·"}</span><span>{text}<span className="sr-only"> ({t(ok ? "pw.met" : "pw.notMet")})</span></span>
    </li>
  );

  return (
    <div className="divide-y divide-border-subtle">
      <Row label={t("profile.email")} value={session.email ?? sessionLabel(session)} action={<Button variant="ghost" onClick={() => { close(); setDone(null); setMode("email"); }}>{t("settings.change")}</Button>}>
        {mode === "email" && verifying ? (
          <CodeStep sentTo={email.trim()} confirmLabel={t("verify.confirmEmail")} onVerified={saveEmail} onBack={() => setVerifying(false)} />
        ) : mode === "email" ? (
          <form className="mt-4 flex max-w-md flex-col gap-3" onSubmit={(e) => { e.preventDefault(); startEmail(); }}>
            <Field label={t("settings.newEmail")} error={emailError ? t("err.email") : undefined}>
              {({ id, describedBy, invalid }) => <Input id={id} type="email" autoComplete="email" value={email} aria-describedby={describedBy} invalid={invalid} onChange={(e) => { setEmailError(false); setEmail(e.target.value); }} />}
            </Field>
            <p className="type-body-sm text-text-secondary">{t("verify.emailNote")}</p>
            <div className="flex gap-3"><Button type="submit">{t("verify.sendCode")}</Button><Button variant="secondary" onClick={close}>{t("profile.cancel")}</Button></div>
          </form>
        ) : null}
        {done === "email" ? <p role="status" className="type-body-sm mt-3 rounded-field bg-success-bg px-3 py-2 text-success-text">{t("settings.emailSaved")}</p> : null}
      </Row>

      <Row
        label={t("pw.title")}
        value={hasPassword ? "••••••••" : t("pw.managed", { method: session.method })}
        action={hasPassword ? <Button variant="ghost" onClick={() => { close(); setDone(null); setMode("password"); }}>{t("settings.change")}</Button> : null}
      >
        {mode === "password" && verifying ? (
          <CodeStep sentTo={session.email ?? sessionLabel(session)} confirmLabel={t("verify.confirmPassword")} onVerified={() => { close(); setDone("password"); }} onBack={() => setVerifying(false)} />
        ) : mode === "password" ? (
          <form className="mt-4 flex max-w-md flex-col gap-4" onSubmit={(e) => { e.preventDefault(); savePassword(); }}>
            <p className="type-body-sm text-text-secondary">{t("pw.intro")}</p>
            <Field label={t("pw.old")} error={errors.old}>{({ id, describedBy, invalid }) => <PasswordInput id={id} value={oldPw} onChange={setOldPw} describedBy={describedBy} invalid={invalid} autoComplete="current-password" />}</Field>
            <Field label={t("pw.new")} error={errors.rules}>{({ id, describedBy, invalid }) => <PasswordInput id={id} value={newPw} onChange={setNewPw} describedBy={describedBy} invalid={invalid} autoComplete="new-password" />}</Field>
            <Field label={t("pw.confirm")} error={errors.confirm}>{({ id, describedBy, invalid }) => <PasswordInput id={id} value={confirmPw} onChange={setConfirmPw} describedBy={describedBy} invalid={invalid} autoComplete="new-password" />}</Field>
            <div aria-hidden className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((n) => <span key={n} className={`h-1.5 rounded-full ${strength >= n ? bar : "bg-border-subtle"}`} />)}
            </div>
            <p className="type-body-sm" role="status">{newPw ? t(`pw.strength.${strength}` as "pw.strength.1") : ""}</p>
            <ul className="type-body-sm flex flex-col gap-1.5">
              {ruleLine(checks.length, t("pw.rule.length"))}
              {ruleLine(checks.letter, t("pw.rule.letter"))}
              {ruleLine(checks.number, t("pw.rule.number"))}
              {ruleLine(checks.symbol, t("pw.rule.symbol", { symbols: "# ? ! @ $ % ^ & * -" }))}
              {ruleLine(checks.plain, t("pw.rule.plain"))}
            </ul>
            <p className="type-body-sm text-text-secondary">{t("verify.passwordNote")}</p>
            <div className="flex gap-3"><Button type="submit">{t("verify.sendCode")}</Button><Button variant="secondary" onClick={close}>{t("profile.cancel")}</Button></div>
          </form>
        ) : null}
        {done === "password" ? <p role="status" className="type-body-sm mt-3 rounded-field bg-success-bg px-3 py-2 text-success-text">{t("pw.saved")}</p> : null}
      </Row>
    </div>
  );
}
