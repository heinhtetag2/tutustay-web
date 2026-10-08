"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useLocale, useT } from "@/i18n/I18nProvider";
import { bookingsStore } from "@/services/bookings.service";
import { createEnquiry, type Enquiry } from "@/services/support.service";
import { useStore } from "@/shared/hooks/useStore";
import { Button } from "@/shared/ui/Button";
import { Field, Input, Select, Textarea } from "@/shared/ui/Field";

const MAX_FILES = 5;
const MAX_BYTES = 5 * 1024 * 1024;
const TOPICS: Enquiry["topic"][] = ["booking", "payment", "account", "other"];

/** 1:1 Q&A. Filed against the account so support can see bookings next to the question. MOCK: nobody receives it. */
export function EnquiryForm() {
  const t = useT();
  const locale = useLocale();
  const router = useRouter();
  const bookings = useStore(bookingsStore);
  const [topic, setTopic] = useState<Enquiry["topic"]>("booking");
  const [ref, setRef] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [subjectError, setSubjectError] = useState<string>();
  const [fileError, setFileError] = useState<string>();
  const [error, setError] = useState<string>();

  /** Adds picked files, keeping to the limits: 5 files, 5MB each. */
  function addFiles(list: FileList | null) {
    const picked = Array.from(list ?? []);
    if (picked.some((f) => f.size > MAX_BYTES)) { setFileError(t("enquiry.err.fileSize")); return; }
    if (files.length + picked.length > MAX_FILES) { setFileError(t("enquiry.err.fileCount")); return; }
    setFileError(undefined);
    setFiles([...files, ...picked]);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const bad = subject.trim().length < 3 || message.trim().length < 10;
    if (bad) {
      setSubjectError(subject.trim().length < 3 ? t("enquiry.err.subject") : undefined);
      setError(message.trim().length < 10 ? t("err.enquiry") : undefined);
      setTimeout(() => document.querySelector<HTMLElement>("form [aria-invalid='true']")?.focus(), 0);
      return;
    }
    createEnquiry({ subject: subject.trim(), topic, bookingRef: ref || undefined, message: message.trim(), attachments: files.map((f) => f.name) });
    router.push(`/${locale}/account/support/inquiries`);
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <p className="type-body-sm text-text-secondary">{t("enquiry.intro")}</p>
      <Field label={t("enquiry.subject")} error={subjectError} required>
        {({ id, describedBy, invalid }) => <Input id={id} value={subject} maxLength={120} onChange={(e) => { setSubject(e.target.value); setSubjectError(undefined); }} aria-describedby={describedBy} invalid={invalid} />}
      </Field>
      <Field label={t("enquiry.topic")}>
        {({ id }) => <Select id={id} value={topic} onChange={(e) => setTopic(e.target.value as Enquiry["topic"])}>{TOPICS.map((x) => <option key={x} value={x}>{t(`enquiry.topic.${x}`)}</option>)}</Select>}
      </Field>
      {bookings.length > 0 ? (
        <Field label={t("enquiry.booking")} hint={t("optional")}>
          {({ id }) => <Select id={id} value={ref} onChange={(e) => setRef(e.target.value)}><option value="">{t("enquiry.noBooking")}</option>{bookings.map((b) => <option key={b.ref} value={b.ref}>{b.ref} · {b.stayName}</option>)}</Select>}
        </Field>
      ) : null}
      <Field label={t("enquiry.message")} error={error} required>
        {({ id, describedBy, invalid }) => <Textarea id={id} rows={5} value={message} onChange={(e) => { setMessage(e.target.value); setError(undefined); }} aria-describedby={describedBy} invalid={invalid} />}
      </Field>
      <Field label={t("enquiry.files")} hint={t("enquiry.fileLimit", { n: MAX_FILES, mb: 5 })} error={fileError}>
        {({ id, describedBy }) => (
          <div className="flex flex-col gap-3">
            {files.length < MAX_FILES ? (
              <label htmlFor={id} className="type-body flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-field border border-border-control bg-surface-raised px-3 transition-colors hover:border-text-primary has-[:focus-visible]:border-text-primary has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2">
                <svg aria-hidden viewBox="0 0 24 24" className="size-5 shrink-0 text-text-secondary" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="m20 11.500-8 8a5 5 0 0 1-7-7l8.500-8.500a3.300 3.300 0 0 1 4.700 4.700L9.500 17.500a1.700 1.700 0 0 1-2.400-2.400L15 7.200" /></svg>
                <span className="flex-1">{t("enquiry.chooseFiles")}</span>
                <span aria-hidden className="type-label rounded-full border border-border-control px-3 py-1">{t("enquiry.browse")}</span>
                <input id={id} type="file" multiple aria-describedby={describedBy} onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} className="sr-only" />
              </label>
            ) : null}
            {files.map((f, i) => (
              <span key={`${f.name}-${i}`} className="type-body-sm inline-flex w-fit max-w-full items-center gap-2 rounded-full border border-border-subtle bg-surface-raised py-1.5 pl-4 pr-1.5">
                <span className="truncate">{f.name}</span>
                <button type="button" aria-label={t("enquiry.removeFile", { name: f.name })} onClick={() => setFiles(files.filter((_, k) => k !== i))} className="inline-flex size-7 cursor-pointer items-center justify-center rounded-full hover:bg-surface-subtle">
                  <svg aria-hidden viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="m3 3 10 10M13 3 3 13" /></svg>
                </button>
              </span>
            ))}
          </div>
        )}
      </Field>
      <Button type="submit" className="self-start">{t("enquiry.send")}</Button>
    </form>
  );
}
