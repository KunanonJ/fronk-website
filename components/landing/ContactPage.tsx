import { useEffect, useRef, useState } from "react";
import { useForm } from "@tanstack/react-form";
import {
  CONTACT_LIMITS,
  CONTACT_TOPICS,
  contactMessages,
  contactPage,
} from "@/lib/content/contact";
import { socials } from "@/lib/content/landing";
import {
  contactFormSchema,
  firstContactError,
  type ContactFormValues,
} from "@/lib/contact/schema";
import { getTurnstileToken } from "@/lib/turnstile/client";
import { GithubIcon, LinkedinIcon } from "@/components/ui/SocialIcons";

function TwitterIcon({ size = 13 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
  );
}

function SocialBtn({
  label,
  href,
  className,
  children,
}: {
  label: string;
  href: string;
  className: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className={`flex h-9 w-9 items-center justify-center rounded-full border border-hairline-strong bg-surface text-ink-2 transition-colors hover:text-ink ${className}`}
    >
      {children}
    </a>
  );
}

const SOCIAL_BUTTONS = [
  {
    label: "X",
    href: socials[0].href,
    className: "",
    Icon: TwitterIcon,
  },
  {
    label: "LinkedIn",
    href: socials[1].href,
    className: "",
    Icon: LinkedinIcon,
  },
  {
    label: "GitHub",
    href: socials[2].href,
    className: "",
    Icon: GithubIcon,
  },
] as const;

const inputClassName =
  "w-full min-w-0 rounded-input border border-hairline-strong bg-surface px-4 py-3 text-body text-ink transition-colors focus:border-focus focus:outline-none focus:ring-2 focus:ring-focus/30";

const labelClassName = "font-mono text-label uppercase text-ink-2";

type Status = "idle" | "sending" | "sent" | "error";

const mailtoHref = `mailto:${contactPage.email}?subject=${encodeURIComponent(contactPage.mailtoSubject)}`;

/** Turnstile runs only once a site key is configured; until then nothing loads. */
const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

const EMPTY: ContactFormValues = {
  name: "",
  email: "",
  message: "",
  topics: [],
  company: "",
};

/**
 * Video contact landing at `/contact`. The form posts to `/api/contact`, which
 * emails the owner through Resend. Success is shown only after the server
 * confirms; on failure the visitor keeps their text and gets a mailto fallback.
 */
export default function ContactPage() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const mountedAt = useRef<number | null>(null);
  const turnstileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mountedAt.current = performance.now();
  }, []);

  const fail = (message: string) => {
    setError(message);
    setStatus("error");
  };

  // TanStack Form holds the values; the shared Valibot schema checks them
  // with the server's wording before anything is sent.
  const form = useForm({
    defaultValues: EMPTY,
    validators: { onSubmit: contactFormSchema },
    onSubmitInvalid: ({ value }) =>
      fail(firstContactError(value) ?? contactMessages.failed),
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

  return (
    <main
      id="main"
      className="forma-contact relative min-h-[100svh] overflow-hidden bg-page text-ink"
    >
      {/* Glaze-to-Clay wash (visual-redesign Phase 3); decorative. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-surface-tint via-page to-surface-warm"
      />

      <div className="relative mx-auto grid w-full max-w-6xl gap-10 px-4 pt-14 pb-20 sm:px-6 md:pt-16 md:pb-28 lg:grid-cols-12 lg:items-start lg:gap-12">
        <div className="lg:col-span-5 lg:pt-6">
          <p className="font-mono text-label uppercase text-ink-2">Contact</p>
          <p className="mt-4 font-display text-[clamp(2.25rem,1.6rem+2.4vw,3.5rem)] leading-[1.05] font-semibold tracking-[-0.04em] text-ink">
            {contactPage.headlineLead}
            <br />
            {contactPage.headlineTail}{" "}
            <span className="text-link">{contactPage.headlineAccent}</span>
          </p>
        </div>

        <div className="lg:col-span-7">
          <div className="flex flex-col gap-5 rounded-panel border border-hairline bg-surface p-5 shadow-card sm:p-8">
            <h1 className="font-display text-h3 text-ink">
              {contactPage.cardTitle}
            </h1>

            {status === "sent" ? (
              <div
                role="status"
                className="flex flex-col items-start gap-3 py-6"
              >
                <div
                  aria-hidden
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-tint text-xl text-success"
                >
                  ✓
                </div>
                <p className="text-lead font-semibold text-ink">
                  {contactPage.successTitle}
                </p>
                <p className="text-body text-ink-2">
                  {contactPage.successBody}
                </p>
              </div>
            ) : (
              <>
                <div className="flex flex-col items-start gap-3 rounded-2xl bg-surface-tint px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 max-w-full">
                    <p className={labelClassName}>{contactPage.directLabel}</p>
                    <a
                      href={mailtoHref}
                      className="mt-1 block font-semibold break-all text-link underline-offset-4 hover:underline sm:truncate sm:break-normal"
                    >
                      {contactPage.email}
                    </a>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {SOCIAL_BUTTONS.map(({ label, href, className, Icon }) => (
                      <SocialBtn
                        key={label}
                        label={label}
                        href={href}
                        className={className}
                      >
                        <Icon size={14} />
                      </SocialBtn>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3" aria-hidden>
                  <div className="h-px flex-1 bg-hairline-strong" />
                  <span className="text-small text-ink-2">
                    {contactPage.divider}
                  </span>
                  <div className="h-px flex-1 bg-hairline-strong" />
                </div>

                <form
                  className="flex flex-col gap-5"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (status === "sending") return;
                    void form.handleSubmit();
                  }}
                >
                  <p className="text-small font-medium text-ink">
                    {contactPage.formLabel}
                  </p>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <label htmlFor="contact-name" className={labelClassName}>
                        {contactPage.namePlaceholder}
                      </label>
                      <form.Field name="name">
                        {(field) => (
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
                            className={inputClassName}
                          />
                        )}
                      </form.Field>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label htmlFor="contact-email" className={labelClassName}>
                        {contactPage.emailPlaceholder}
                      </label>
                      <form.Field name="email">
                        {(field) => (
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
                            className={inputClassName}
                          />
                        )}
                      </form.Field>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="contact-message" className={labelClassName}>
                      {contactPage.messagePlaceholder}
                    </label>
                    <form.Field name="message">
                      {(field) => (
                        <textarea
                          id="contact-message"
                          name="message"
                          rows={5}
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                          minLength={CONTACT_LIMITS.messageMin}
                          maxLength={CONTACT_LIMITS.messageMax}
                          required
                          className={`${inputClassName} resize-none`}
                        />
                      )}
                    </form.Field>
                  </div>

                  {/* Honeypot: hidden from people and assistive tech, tempting to bots. */}
                  <div
                    aria-hidden
                    className="absolute -left-[9999px] h-px w-px overflow-hidden"
                  >
                    <label htmlFor="contact-company">Company</label>
                    <form.Field name="company">
                      {(field) => (
                        <input
                          id="contact-company"
                          type="text"
                          name="company"
                          tabIndex={-1}
                          autoComplete="off"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                        />
                      )}
                    </form.Field>
                  </div>

                  <fieldset className="flex flex-col gap-2">
                    <legend className={`${labelClassName} mb-2`}>
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
                                className={`inline-flex min-h-9 items-center rounded-full border px-3.5 text-small font-medium transition-colors ${
                                  active
                                    ? "border-action bg-surface-tint text-ink"
                                    : "border-hairline-strong bg-surface text-ink-2 hover:border-ink/40 hover:text-ink"
                                }`}
                              >
                                {topic}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </form.Field>
                  </fieldset>

                  <div aria-live="polite" className="text-small">
                    {/* Turnstile mounts here only when configured; invisible unless it needs the visitor. */}
                    {TURNSTILE_SITE_KEY ? <div ref={turnstileRef} /> : null}
                    {status === "error" && error ? (
                      <p className="flex items-start gap-2.5 rounded-xl border border-hairline-strong bg-surface px-3.5 py-3 text-error">
                        {/* Ember marks the failure; the words carry it. */}
                        <span
                          aria-hidden
                          className="mt-1.5 size-2 shrink-0 bg-ember"
                        />
                        <span>
                          {error} {contactPage.errorFallbackLead}{" "}
                          <a
                            href={mailtoHref}
                            className="font-semibold text-link underline"
                          >
                            {contactPage.email}
                          </a>
                          .
                        </span>
                      </p>
                    ) : null}
                  </div>

                  <button
                    type="submit"
                    disabled={status === "sending"}
                    className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-action text-sm font-semibold text-on-action transition-colors hover:bg-action-hover disabled:opacity-60"
                  >
                    {status === "sending"
                      ? contactPage.sending
                      : contactPage.submit}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
