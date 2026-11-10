import { useEffect, useRef, useState, type ReactNode } from "react";
import { revalidateLogic, useForm } from "@tanstack/react-form";
import { BentoCard } from "@/components/bento/Bento";
import { ctaClasses } from "@/components/bento/Buttons";
import { CheckIcon } from "@/components/bento/icons";
import {
  CONTACT_LIMITS,
  CONTACT_TOPICS,
  contactMessages,
  contactPage,
} from "@/lib/content/contact";
import {
  contactFormSchema,
  firstContactIssue,
  type ContactFormValues,
} from "@/lib/contact/schema";
import { getTurnstileToken } from "@/lib/turnstile/client";
import { cn } from "@/lib/utils/cn";

type Status = "idle" | "sending" | "sent" | "error";

export const contactMailto = `mailto:${contactPage.email}?subject=${encodeURIComponent(contactPage.mailtoSubject)}`;

/** Turnstile runs only once a site key is configured; until then nothing loads. */
const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

const EMPTY: ContactFormValues = {
  name: "",
  email: "",
  message: "",
  topics: [],
  company: "",
};

const LABEL = "font-mono text-xs tracking-[0.06em] text-ink-2 uppercase";
const INPUT =
  "w-full min-w-0 rounded-2xl border border-hairline-strong bg-page px-4 text-base text-ink";

/** The first message of a field's errors (strings or Standard Schema issues). */
function errorText(errors: readonly unknown[]): string | undefined {
  const first = errors[0];
  if (typeof first === "string") return first;
  if (first && typeof first === "object" && "message" in first)
    return String(first.message);
  return undefined;
}

/** A field's error row: the Ember square beside the words, on the card. */
function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p
      id={id}
      className="m-0 flex items-center gap-2 text-meta leading-[1.4] text-ink"
    >
      <span aria-hidden className="size-2 shrink-0 bg-ember" />
      <span>{message}</span>
    </p>
  );
}

function Field({
  id,
  label,
  error,
  className,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-2", className)}>
      <label htmlFor={id} className={LABEL}>
        {label}
      </label>
      {children}
      <FieldError id={`${id}-error`} message={error} />
    </div>
  );
}

/** aria props for an input with an optional error row. */
function invalidProps(id: string, error?: string) {
  return error
    ? { "aria-invalid": true, "aria-describedby": `${id}-error` }
    : { "aria-invalid": false };
}

/**
 * The "Say hello" card (bento canvas, design spec 4.3 and gap 21). The form
 * posts to /api/contact, which emails the owner through Resend.
 *
 * - Validation: the shared Valibot schema (the server's wording) runs on
 *   submit, then on every change once a submit has been tried. Errors show
 *   under each field and the first invalid field takes focus.
 * - Spam: a honeypot field, the time since mount, and Cloudflare Turnstile,
 *   which loads only on submit and only once a site key is configured.
 * - Sending: the button reads "Sending..." and ignores repeat presses.
 * - Sent: shown only after the server confirms; focus moves to it.
 * - Failed: the server's message (not connected, rate limited, spam check,
 *   too large, or failed) with the email address as a fallback; the
 *   visitor's text stays in the form.
 */
export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const mountedAt = useRef<number | null>(null);
  const turnstileRef = useRef<HTMLDivElement>(null);
  const sentRef = useRef<HTMLDivElement>(null);
  const focusNameNext = useRef(false);

  useEffect(() => {
    mountedAt.current = performance.now();
  }, []);

  // The form disappears on success, so focus follows the confirmation; after
  // "Send another message" it returns to the first field.
  useEffect(() => {
    if (status === "sent") sentRef.current?.focus();
    if (status === "idle" && focusNameNext.current) {
      focusNameNext.current = false;
      document.getElementById("contact-name")?.focus();
    }
  }, [status]);

  const fail = (message: string) => {
    setError(message);
    setStatus("error");
  };

  const form = useForm({
    defaultValues: EMPTY,
    validationLogic: revalidateLogic(),
    validators: { onDynamic: contactFormSchema },
    onSubmitInvalid: ({ value }) => {
      const issue = firstContactIssue(value);
      if (issue) document.getElementById(`contact-${issue.field}`)?.focus();
    },
    onSubmit: async ({ value }) => {
      setStatus("sending");
      setError("");
      const elapsedMs =
        mountedAt.current === null
          ? null
          : performance.now() - mountedAt.current;

      let turnstileToken: string | undefined;
      if (TURNSTILE_SITE_KEY && turnstileRef.current) {
        const token = await getTurnstileToken(
          turnstileRef.current,
          TURNSTILE_SITE_KEY,
        );
        if (!token) return fail(contactMessages.botCheck);
        turnstileToken = token;
      }

      try {
        const response = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...value, elapsedMs, turnstileToken }),
        });
        const data = (await response.json().catch(() => null)) as {
          ok?: boolean;
          message?: string;
        } | null;
        if (response.ok && data?.ok) {
          setStatus("sent");
          return;
        }
        fail(data?.message ?? contactMessages.failed);
      } catch {
        fail(contactMessages.failed);
      }
    },
  });

  const sending = status === "sending";

  return (
    <BentoCard
      id={contactPage.formId}
      headingId="card-form"
      title={contactPage.cardTitle}
      span={2}
      gap={4.5}
      minHeight={false}
      className="scroll-mt-6 min-[641px]:row-span-2"
    >
      {status === "sent" ? (
        <div className="my-auto flex flex-col items-start gap-5 px-1 pb-6">
          <div
            ref={sentRef}
            tabIndex={-1}
            role="status"
            className="flex flex-col items-start gap-3 focus:outline-none"
          >
            <span
              aria-hidden
              className="mb-2 inline-flex size-14 items-center justify-center rounded-full bg-surface-tint text-mark"
            >
              <CheckIcon size={24} />
            </span>
            <p className="m-0 text-[28px] leading-[1.2] font-semibold tracking-[-0.02em]">
              {contactPage.successTitle}
            </p>
            <p className="m-0 text-base leading-[1.55] text-ink-2">
              {contactPage.successBody}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              form.reset();
              setError("");
              focusNameNext.current = true;
              setStatus("idle");
            }}
            className="inline-flex h-12 items-center rounded-full border border-hairline-strong bg-surface px-[22px] text-card font-medium text-ink"
          >
            {contactPage.sendAnother}
          </button>
        </div>
      ) : (
        <form
          aria-labelledby="card-form"
          noValidate
          className="m-0 flex flex-col gap-5 px-1 pt-1"
          onSubmit={(e) => {
            e.preventDefault();
            if (sending) return;
            void form.handleSubmit();
          }}
        >
          <p className="m-0 text-card font-medium">{contactPage.formLabel}</p>

          <div className="flex flex-wrap gap-5">
            <form.Field name="name">
              {(field) => {
                const fieldError = errorText(field.state.meta.errors);
                return (
                  <Field
                    id="contact-name"
                    label={contactPage.namePlaceholder}
                    error={fieldError}
                    className="flex-[1_1_220px]"
                  >
                    <input
                      id="contact-name"
                      type="text"
                      name="name"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      autoComplete="name"
                      maxLength={CONTACT_LIMITS.nameMax}
                      required
                      {...invalidProps("contact-name", fieldError)}
                      className={cn(INPUT, "h-[52px]")}
                    />
                  </Field>
                );
              }}
            </form.Field>
            <form.Field name="email">
              {(field) => {
                const fieldError = errorText(field.state.meta.errors);
                return (
                  <Field
                    id="contact-email"
                    label={contactPage.emailPlaceholder}
                    error={fieldError}
                    className="flex-[1_1_220px]"
                  >
                    <input
                      id="contact-email"
                      type="email"
                      name="email"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      autoComplete="email"
                      maxLength={CONTACT_LIMITS.emailMax}
                      required
                      {...invalidProps("contact-email", fieldError)}
                      className={cn(INPUT, "h-[52px]")}
                    />
                  </Field>
                );
              }}
            </form.Field>
          </div>

          <form.Field name="message">
            {(field) => {
              const fieldError = errorText(field.state.meta.errors);
              return (
                <Field
                  id="contact-message"
                  label={contactPage.messagePlaceholder}
                  error={fieldError}
                >
                  <textarea
                    id="contact-message"
                    name="message"
                    rows={6}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    minLength={CONTACT_LIMITS.messageMin}
                    maxLength={CONTACT_LIMITS.messageMax}
                    required
                    {...invalidProps("contact-message", fieldError)}
                    className={cn(
                      INPUT,
                      "min-h-40 resize-y py-3.5 leading-normal",
                    )}
                  />
                </Field>
              );
            }}
          </form.Field>

          {/* Honeypot: hidden from people and assistive tech, tempting to bots.
              Its name and label avoid anything browser autofill recognises
              (a "company" field got filled from address profiles, silently
              dropping real messages); it still maps to `company`. */}
          <div
            aria-hidden
            className="absolute -left-[9999px] h-px w-px overflow-hidden"
          >
            <label htmlFor="contact-hp">Leave this field empty</label>
            <form.Field name="company">
              {(field) => (
                <input
                  id="contact-hp"
                  type="text"
                  name="hp_field"
                  tabIndex={-1}
                  autoComplete="off"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              )}
            </form.Field>
          </div>

          <fieldset className="m-0 min-w-0 border-0 p-0">
            <legend className={cn(LABEL, "mb-2.5 p-0")}>
              {contactPage.topicsLabel}
            </legend>
            <form.Field name="topics">
              {(field) => (
                <div className="flex flex-wrap gap-2">
                  {CONTACT_TOPICS.map((topic) => {
                    const topics = field.state.value;
                    const active = topics.includes(topic);
                    return (
                      <button
                        key={topic}
                        type="button"
                        aria-pressed={active}
                        onClick={() =>
                          field.handleChange(
                            active
                              ? topics.filter((t) => t !== topic)
                              : [...topics, topic],
                          )
                        }
                        className={cn(
                          "inline-flex min-h-11 items-center gap-1.5 rounded-full border px-4 text-sm font-medium",
                          active
                            ? "border-mark bg-surface-tint text-ink"
                            : "border-hairline-strong bg-surface text-ink-2",
                        )}
                      >
                        {active ? (
                          <CheckIcon size={14} className="text-mark" />
                        ) : null}
                        {topic}
                      </button>
                    );
                  })}
                </div>
              )}
            </form.Field>
          </fieldset>

          {/* Turnstile mounts here only when configured; invisible unless it needs the visitor. */}
          {TURNSTILE_SITE_KEY ? <div ref={turnstileRef} /> : null}

          <div aria-live="polite">
            {status === "error" && error ? (
              <p className="m-0 flex items-start gap-2.5 rounded-2xl border border-hairline-strong bg-surface px-3.5 py-3 text-sm leading-normal text-ink">
                {/* Ember marks the failure on the surface; the words carry it. */}
                <span aria-hidden className="mt-1.5 size-2 shrink-0 bg-ember" />
                <span>
                  {error} {contactPage.errorFallbackLead}{" "}
                  <a href={contactMailto} className="font-semibold">
                    {contactPage.email}
                  </a>
                  .
                </span>
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            <button
              type="submit"
              aria-disabled={sending}
              className={cn(
                ctaClasses("primary", "md"),
                "border-0",
                sending && "cursor-progress opacity-60",
              )}
            >
              {sending ? contactPage.sending : contactPage.submit}
            </button>
          </div>
        </form>
      )}
    </BentoCard>
  );
}
