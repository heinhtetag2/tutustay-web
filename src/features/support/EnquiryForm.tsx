"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useLocale, useT } from "@/i18n/I18nProvider";
import { bookingsStore } from "@/services/bookings.service";
import { createEnquiry, type Enquiry } from "@/services/support.service";
import { useStore } from "@/shared/hooks/useStore";
import { Button } from "@/shared/ui/Button";
import { Field, Select, Textarea } from "@/shared/ui/Field";

const TOPICS: Enquiry["topic"][] = ["booking", "payment", "account", "other"];

/** 1:1 Q&A. Filed against the account so support can see bookings next to the question. MOCK: nobody receives it. */
export function EnquiryForm() {
  const t = useT();
  const locale = useLocale();
  const router = useRouter();
  const bookings = useStore(bookingsStore);
  const [topic, setTopic] = useState<Enquiry["topic"]>("booking");
  const [ref, setRef] = useState("");
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<string[]>([]);
  const [error, setError] = useState<string>();

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (message.trim().length < 10) { setError(t("err.enquiry")); setTimeout(() => document.querySelector<HTMLElement>("form [aria-invalid='true']")?.focus(), 0); return; }
    createEnquiry({ topic, bookingRef: ref || undefined, message: message.trim(), attachments: files });
    router.push(`/${locale}/account/support/inquiries`);
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <p className="type-body-sm text-text-secondary">{t("enquiry.intro")}</p>
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
      <Field label={t("enquiry.attach")} hint={t("enquiry.attachHint")}>
        {({ id, describedBy }) => <input id={id} type="file" multiple aria-describedby={describedBy} onChange={(e) => setFiles(Array.from(e.target.files ?? []).map((f) => f.name))} className="type-body-sm min-h-11 w-full rounded-field border border-border-control bg-surface-raised p-2" />}
      </Field>
      <Button type="submit" className="self-start">{t("enquiry.send")}</Button>
    </form>
  );
}
