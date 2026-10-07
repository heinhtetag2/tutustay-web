"use client";

import { SESSION_HOURS, STAY_TYPES, type SessionHours, type StayType } from "@/domain";
import { useT } from "@/i18n/I18nProvider";

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
    <fieldset className="flex flex-col gap-3">
      <legend className="type-label mb-2">{t("stayType.label")}</legend>
      {/* A grey track with a white pill that slides under the chosen type; */}
      <div className="relative grid grid-cols-3 rounded-full bg-surface-subtle p-1 shadow-[inset_0_1px_2px_#0000000f]">
        <span
          aria-hidden
          className="absolute inset-y-1 left-1 w-[calc((100%-0.5rem)/3)] rounded-full bg-surface-raised shadow-[0_2px_8px_#00000021,0_0_0_1px_#0000000d] transition-transform duration-[350ms] ease-[cubic-bezier(0.32,0.72,0,1)]"
          style={{ transform: `translateX(${Math.max(0, STAY_TYPES.indexOf(stayType)) * 100}%)` }}
        />
        {STAY_TYPES.map((s) => {
          const disabled = offered ? !offered.includes(s) : false;
          const selected = s === stayType;
          return (
            <label
              key={s}
              className={`relative z-10 flex min-h-11 items-center justify-center rounded-full px-1.5 text-center text-sm transition-colors duration-200 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-border-focus ${
                disabled ? "cursor-not-allowed font-medium text-text-disabled"
                : selected ? "cursor-pointer font-semibold text-text-primary"
                : "cursor-pointer font-medium text-text-secondary hover:text-text-primary"
              }`}
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
        <div role="radiogroup" aria-label={t("stayType.sessionLength")} className="flex flex-col gap-2">
          <span className="type-label">{t("stayType.sessionLength")}</span>
          <div className="flex flex-wrap gap-2">
            {hours.map((h) => {
              const on = h === sessionHours;
              return (
                <button
                  key={h} type="button" role="radio" aria-checked={on}
                  onClick={() => onChange({ stayType, sessionHours: h as SessionHours })}
                  className={`min-h-10 cursor-pointer rounded-full border px-4 text-sm font-medium transition-colors ${on ? "border-action-primary bg-action-primary text-text-on-action" : "border-border-subtle bg-surface-raised hover:bg-surface-subtle"}`}
                >
                  {t("stayType.hours", { n: h })}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </fieldset>
  );
}
