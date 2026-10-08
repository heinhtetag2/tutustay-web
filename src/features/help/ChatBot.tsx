"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useT } from "@/i18n/I18nProvider";
import { LocalLink } from "@/shared/components/LocalLink";
import { cn } from "@/shared/lib/cn";
import { findAnswer, SUGGESTED_IDS } from "./chatMatch";
import { FAQ } from "./faq";

type Msg = { id: number; from: "bot" | "me"; text: string; link?: { href: string; label: string } };

/**
 * A floating helper in the bottom-right corner. It answers from the Help centre's FAQ: guests tap a ready-made question or type their own,
 * and when nothing fits it points to a real person (the 1:1 question form). It is a rule-based helper, not an AI, and says so.
 */
export function ChatBot() {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const next = useRef(1);
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const suggested = SUGGESTED_IDS.map((id) => FAQ.find((f) => f.id === id)).filter((f): f is NonNullable<typeof f> => Boolean(f));

  const push = (m: Omit<Msg, "id">) => setMsgs((all) => [...all, { ...m, id: next.current++ }]);

  useEffect(() => {
    if (open && msgs.length === 0) push({ from: "bot", text: t("bot.hello") });
    if (open) setTimeout(() => input.current?.focus(), 50);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // Show the newest message from its top (so a long answer is read from the first line), not the bottom of the list, which holds the question buttons.
  useEffect(() => {
    const box = list.current;
    const last = box?.querySelector<HTMLElement>("[data-last]");
    if (!box || !last) return;
    box.scrollTo({ top: Math.max(0, last.offsetTop - 12), behavior: "smooth" });
  }, [msgs.length]);

  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [open]);

  function ask(question: string, id?: string) {
    const q = question.trim();
    if (!q || typing) return;
    push({ from: "me", text: q });
    setText("");
    setTyping(true);
    const hit = id ? FAQ.find((f) => f.id === id) ?? null : findAnswer(q);
    setTimeout(() => {
      if (hit) push({ from: "bot", text: hit.a, link: { href: `/help/faq#${hit.id}`, label: t("bot.readMore") } });
      else push({ from: "bot", text: t("bot.noAnswer"), link: { href: "/help/inquiry", label: t("enquiry.write") } });
      setTyping(false);
    }, 450);
  }

  const onSubmit = (e: FormEvent) => { e.preventDefault(); ask(text); };

  return (
    <>
      <button
        type="button" aria-label={t("bot.open")} aria-expanded={open} aria-controls="chatbot-panel" onClick={() => setOpen((o) => !o)}
        className="fixed bottom-20 right-4 z-30 inline-flex size-12 sm:size-14 cursor-pointer items-center justify-center rounded-full bg-action-cta text-text-on-action shadow-high transition-transform hover:scale-105 sm:bottom-5 sm:right-5"
      >
        {open ? (
          <svg aria-hidden viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="m6 6 12 12M18 6 6 18" /></svg>
        ) : (
          <svg aria-hidden viewBox="0 0 24 24" className="size-7" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M5 5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-7l-4.500 3.500V17H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" /><path d="M8 10h.01M12 10h.01M16 10h.01" /></svg>
        )}
      </button>

      {open ? (
        <section
          id="chatbot-panel" role="dialog" aria-label={t("bot.title")}
          className="fixed inset-x-3 bottom-40 z-30 flex max-h-[min(34rem,calc(100dvh-11rem))] flex-col overflow-hidden rounded-card border border-border-subtle bg-surface-raised shadow-high sm:inset-x-auto sm:bottom-24 sm:right-5 sm:w-[24rem] sm:max-h-[min(36rem,calc(100dvh-8rem))]"
        >
          <header className="flex items-center gap-3 bg-action-cta px-4 py-3 text-text-on-action">
            <span aria-hidden className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#ffffff33]">
              <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="8" width="16" height="11" rx="3" /><path d="M12 4v4M9 13h.01M15 13h.01M10 16h4" /></svg>
            </span>
            <div className="min-w-0 flex-1"><p className="type-label">{t("bot.title")}</p><p className="type-body-sm opacity-90">{t("bot.subtitle")}</p></div>
            <button type="button" aria-label={t("common.close")} onClick={() => setOpen(false)} className="inline-flex size-9 cursor-pointer items-center justify-center rounded-full hover:bg-[#ffffff26]">
              <svg aria-hidden viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="m3 3 10 10M13 3 3 13" /></svg>
            </button>
          </header>

          <div ref={list} aria-live="polite" className="relative flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto bg-surface-raised p-4">
            {msgs.map((m, i) => (
              <div key={m.id} data-last={i === msgs.length - 1 ? "" : undefined} className={cn("flex", m.from === "me" ? "justify-end" : "justify-start")}>
                <div className={cn("type-body-sm max-w-[85%] rounded-card px-3.5 py-2.5", m.from === "me" ? "bg-action-cta text-text-on-action" : "bg-surface-brand-subtle text-text-primary")}>
                  <p>{m.text}</p>
                  {m.link ? <LocalLink href={m.link.href} className="type-label mt-2 inline-block text-text-link underline-offset-4 hover:underline">{m.link.label} →</LocalLink> : null}
                </div>
              </div>
            ))}
            {typing ? <p className="type-body-sm text-text-secondary" aria-label={t("bot.typing")}>···</p> : null}
            <div className="flex flex-col items-start gap-2 pt-1">
              <p className="type-body-sm text-text-secondary">{t("bot.suggested")}</p>
              {suggested.map((f) => (
                <button key={f.id} type="button" disabled={typing} onClick={() => ask(f.q, f.id)} className="type-body-sm cursor-pointer rounded-full border border-border-control bg-surface-raised px-3.5 py-2 text-left transition-colors hover:border-text-primary disabled:cursor-not-allowed disabled:opacity-50">{f.q}</button>
              ))}
            </div>
          </div>

          <form onSubmit={onSubmit} className="flex items-center gap-2 border-t border-border-subtle p-3">
            <input
              ref={input} value={text} onChange={(e) => setText(e.target.value)} maxLength={200} placeholder={t("bot.placeholder")} aria-label={t("bot.placeholder")}
              className="type-body min-h-11 min-w-0 flex-1 rounded-full border border-border-control bg-surface-raised px-4 outline-none focus:border-text-primary"
            />
            <button type="submit" aria-label={t("bot.send")} disabled={!text.trim() || typing} className="inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-action-cta text-text-on-action disabled:cursor-not-allowed disabled:opacity-40">
              <svg aria-hidden viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12 20 4l-5 16-3.500-6.500Z" /><path d="m11.500 13.500 8-9" /></svg>
            </button>
          </form>
        </section>
      ) : null}
    </>
  );
}
