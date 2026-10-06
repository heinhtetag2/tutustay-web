"use client";

import { useEffect, useMemo, useState } from "react";
import { useT } from "@/i18n/I18nProvider";
import { Field, Input } from "@/shared/ui/Field";
import { LocalLink } from "@/shared/components/LocalLink";
import { EmptyState } from "@/shared/ui/States";
import { FAQ } from "./faq";

export function FaqList() {
  const t = useT();
  const [q, setQ] = useState("");
  const [topic, setTopic] = useState<"all" | "billing" | "booking">("all");
  const [openId, setOpenId] = useState<string | null>(null);
  // Deep links like /help/faq#fee open and scroll to that question (the Help page links to them).
  useEffect(() => {
    const open = () => { const id = window.location.hash.slice(1); if (id) { setTopic("all"); setQ(""); setOpenId(id); setTimeout(() => document.getElementById(id)?.scrollIntoView({ block: "center" }), 50); } };
    open();
    window.addEventListener("hashchange", open);
    return () => window.removeEventListener("hashchange", open);
  }, []);
  const items = useMemo(() => FAQ.filter((f) => (topic === "all" || f.topic === topic) && `${f.q} ${f.a}`.toLowerCase().includes(q.trim().toLowerCase())), [q, topic]);
  return (
    <div className="flex flex-col gap-4">
      <Field label={t("help.search")}>
        {({ id }) => (
          <div className="relative">
            <svg aria-hidden viewBox="0 0 24 24" className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-text-secondary" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="11" cy="11" r="6.500" /><path d="m16 16 4.500 4.500" /></svg>
            <Input id={id} type="search" value={q} onChange={(e) => setQ(e.target.value)} className="min-h-12 rounded-full pl-12 pr-12 [&::-webkit-search-cancel-button]:hidden" />
            {q ? (
              <button type="button" aria-label={t("common.clear")} onClick={() => setQ("")} className="absolute right-2 top-1/2 flex size-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-text-secondary hover:bg-surface-subtle hover:text-text-primary">
                <svg aria-hidden viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
              </button>
            ) : null}
          </div>
        )}
      </Field>
      <div role="group" aria-label={t("help.topics")} className="flex flex-wrap gap-2">
        {(["all", "billing", "booking"] as const).map((x) => (
          <button key={x} type="button" aria-pressed={topic === x} onClick={() => setTopic(x)} className={`type-label min-h-11 rounded-full border px-5 transition-colors ${topic === x ? "border-transparent bg-surface-brand-subtle text-text-brand" : "border-border-control hover:bg-surface-subtle"}`}>{t(`help.topic.${x}`)}</button>
        ))}
      </div>
      {items.length === 0 ? (
        <EmptyState title={t("help.empty.title")} body={t("help.empty.body")} />
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((f) => (
            <li key={f.id}>
              <details
                id={f.id} open={openId === f.id || undefined}
                onToggle={(e) => { if (!e.currentTarget.open && openId === f.id) setOpenId(null); }}
                className="group scroll-mt-24 overflow-hidden rounded-card border border-border-subtle bg-surface-raised transition-colors hover:border-border-control open:border-border-control open:shadow-raised"
              >
                <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 [&::-webkit-details-marker]:hidden">
                  <span className="type-subheading">{f.q}</span>
                  <span aria-hidden className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-subtle text-text-primary transition-all duration-200 group-open:rotate-180 group-open:bg-surface-brand-subtle group-open:text-text-brand">
                    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                  </span>
                </summary>
                <div className="anim-rise border-t border-border-subtle px-5 pb-5 pt-4">
                  <p className="type-body text-text-secondary">{f.a}</p>
                </div>
              </details>
            </li>
          ))}
        </ul>
      )}
      <section aria-labelledby="still" className="mt-4 rounded-card bg-surface-brand-subtle p-5">
        <h2 id="still" className="type-subheading">{t("faq.still")}</h2>
        <p className="type-body-sm mt-1 text-text-secondary">{t("faq.stillBody")}</p>
        <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-1">
          <li><LocalLink href="/help/inquiry" className="type-label inline-flex min-h-11 items-center text-text-link">{t("footer.qa")}</LocalLink></li>
          <li><LocalLink href="/account/support/inquiries" className="type-label inline-flex min-h-11 items-center text-text-link">{t("enquiry.mine")}</LocalLink></li>
          <li><LocalLink href="/help" className="type-label inline-flex min-h-11 items-center text-text-link">{t("footer.helpCentre")}</LocalLink></li>
          <li><LocalLink href="/help/contact" className="type-label inline-flex min-h-11 items-center text-text-link">{t("faq.contactSupport")}</LocalLink></li>
        </ul>
      </section>
    </div>
  );
}
