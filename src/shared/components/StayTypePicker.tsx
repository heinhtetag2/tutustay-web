"use client";

import { SESSION_HOURS, STAY_TYPES, type SessionHours, type StayType } from "@/domain";
import { useT } from "@/i18n/I18nProvider";
import { Select } from "../ui/Field";

interface Props {
  stayType: StayType;
  sessionHours: SessionHours;
  onChange: (next: { stayType: StayType; sessionHours: SessionHours }) => void;
  /** Stay types the current property offers. Others are disabled WITH a reason. */
  offered?: StayType[];
  /** Session lengths this property offers. Set by the hotel (Terms §04). */
  hours?: readonly number[];
}

/** Segmented radio group: Overnight / Session / Daycation, plus session length when relevant. */
export function StayTypePicker({ stayType, sessionHours, onChange, offered, hours = SESSION_HOURS }: Props) {
  const t = useT();
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="type-label mb-2">{t("stayType.label")}</legend>
      <div className="grid grid-cols-3 gap-2">
        {STAY_TYPES.map((s) => {
          const disabled = offered ? !offered.includes(s) : false;
          const selected = s === stayType;
          return (
            <label
              key={s}
              className={`type-label flex min-h-11 cursor-pointer items-center justify-center rounded-field border px-2 text-center ${
                selected ? "border-border-focus bg-surface-brand-subtle text-text-brand" : "border-border-control bg-surface-raised"
              } ${disabled ? "cursor-not-allowed bg-surface-subtle text-text-disabled" : ""}`}
            >
              <input
                type="radio" name="stayType" value={s} className="sr-only" checked={selected} disabled={disabled}
                onChange={() => onChange({ stayType: s, sessionHours })}
              />
              {t(`stayType.${s}`)}
            </label>
          );
        })}
      </div>
      {offered && STAY_TYPES.some((s) => !offered.includes(s)) ? (
        <p className="type-body-sm text-text-secondary">{t("stayType.notOffered")}</p>
      ) : null}
      {stayType === "session" ? (
        <label className="mt-1 flex flex-col gap-2">
          <span className="type-label">{t("stayType.sessionLength")}</span>
          <Select
            value={sessionHours}
            onChange={(e) => onChange({ stayType, sessionHours: Number(e.target.value) as SessionHours })}
          >
            {hours.map((h) => <option key={h} value={h}>{t("stayType.hours", { n: h })}</option>)}
          </Select>
        </label>
      ) : null}
    </fieldset>
  );
}
