"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { EMPTY_NRC, formatNrc, NRC_STATES, NRC_TOWNSHIPS, NRC_TYPES, parseNrc, type NrcParts, type NrcType } from "@/domain/nrc";
import { useLocale, useT } from "@/i18n/I18nProvider";
import { cn } from "../lib/cn";
import { Input, Select } from "../ui/Field";

const burmeseDigits = (s: string) => s.replace(/\d/g, (d) => "၀၁၂၃၄၅၆၇၈၉"[Number(d)]!);

/**
 * Myanmar NRC number as guided choices: state or region, township code, citizenship letter, then the 6-digit number.
 * `value` and `onChange` use the written form (`12/BaHaNa(N)123456`); onChange gets "" until the number is complete.
 */
export function NrcField({ label, hint, value, onChange, className }: { label: string; hint?: string; value: string; onChange: (v: string) => void; className?: string }) {
  const t = useT();
  const locale = useLocale();
  const id = useId();
  const [parts, setParts] = useState<NrcParts>(() => parseNrc(value));

  // Follow outside changes (for example the form being reset or reopened) without fighting the guest's typing.
  useEffect(() => { if (value !== formatNrc(parts)) setParts(parseNrc(value)); }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  const townships = useMemo(() => NRC_TOWNSHIPS.filter((r) => r[0] === parts.state), [parts.state]);
  const my = locale === "my";
  const update = (next: NrcParts) => { setParts(next); onChange(formatNrc(next)); };
  const preview = formatNrc(parts);
  const typeName: Record<NrcType, string> = { N: t("nrc.typeN"), E: t("nrc.typeE"), P: t("nrc.typeP") };
  const typeMm: Record<NrcType, string> = { N: "နိုင်", E: "ဧည့်", P: "ပြု" };
  const half = parts.number.length > 0 && parts.number.length < 6;

  return (
    <fieldset className={cn("flex flex-col gap-2", className)}>
      <legend className="type-label mb-2 text-text-primary">{label}</legend>
      <div className="grid grid-cols-2 gap-3">
        <Select aria-label={t("nrc.state")} value={parts.state ?? ""} onChange={(e) => update({ ...parts, state: e.target.value ? Number(e.target.value) : null, township: "" })}>
          <option value="">{t("nrc.state")}</option>
          {NRC_STATES.map((s) => <option key={s.code} value={s.code}>{my ? burmeseDigits(String(s.code)) : s.code} · {my ? s.mm : s.en}</option>)}
        </Select>
        <Select aria-label={t("nrc.township")} value={parts.township} disabled={!parts.state} onChange={(e) => update({ ...parts, township: e.target.value })}>
          <option value="">{t("nrc.township")}</option>
          {townships.map((r) => <option key={r[1]} value={r[1]}>{my ? `${r[2]} (${r[3]})` : `${r[1]} (${r[3]})`}</option>)}
        </Select>
        <Select aria-label={t("nrc.type")} value={parts.type} onChange={(e) => update({ ...parts, type: e.target.value as NrcType | "" })}>
          <option value="">{t("nrc.type")}</option>
          {NRC_TYPES.map((x) => <option key={x} value={x}>{my ? typeMm[x] : x} · {typeName[x]}</option>)}
        </Select>
        <Input
          id={id} aria-label={t("nrc.number")} inputMode="numeric" autoComplete="off" maxLength={6} placeholder="123456" value={parts.number}
          onChange={(e) => update({ ...parts, number: e.target.value.replace(/\D/g, "").slice(0, 6) })}
          aria-describedby={`${id}-hint`}
        />
      </div>
      <p id={`${id}-hint`} className="type-body-sm text-text-secondary" aria-live="polite">
        {preview ? <>{t("nrc.preview")} <span className="type-label text-text-primary">{my ? burmeseDigits(preview) : preview}</span></> : half ? t("nrc.sixDigits") : hint}
      </p>
    </fieldset>
  );
}

export { EMPTY_NRC };
