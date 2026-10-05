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
      <Field label={t("help.search")}>{({ id }) => <Input id={id} type="search" value={q} onChange={(e) => setQ(e.target.value)} />}</Field>
      <div role="group" aria-label={t("help.topics")} className="flex flex-wrap gap-2">
        {(["all", "billing", "booking"] as const).map((x) => (
          <button key={x} type="button" aria-pressed={topic === x} onClick={() => setTopic(x)} className={`type-label min-h-11 rounded-control border px-4 ${topic === x ? "border-border-focus bg-surface-brand-subtle text-text-brand" : "border-border-control"}`}>{t(`help.topic.${x}`)}</button>
        ))}
      </div>
      {items.length === 0 ? (
        <EmptyState title={t("help.empty.title")} body={t("help.empty.body")} />
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((f) => (
            <li key={f.id}>
              <details id={f.id} open={openId === f.id || undefined} onToggle={(e) => { if (!e.currentTarget.open && openId === f.id) setOpenId(null); }} className="scroll-mt-24 rounded-card border border-border-subtle bg-surface-raised p-4">
                <summary className="type-label cursor-pointer">{f.q}</summary>
                <p className="type-body mt-3 text-text-secondary">{f.a}</p>
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
