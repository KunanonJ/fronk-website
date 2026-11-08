"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import LandingTopNav from "@/components/landing/LandingTopNav";
import {
  CONTACT_LIMITS,
  CONTACT_TOPICS,
  contactMessages,
  contactPage,
  type ContactTopic,
} from "@/lib/content/contact";
import { socials } from "@/lib/content/landing";
import { expandHashHref } from "@/lib/landing/nav";

const VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260602_150901_c45b90ec-18d7-42ff-90e2-b95d7109e330.mp4";

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

function LinkedinIcon({ size = 13 }: { size?: number }) {
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
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function GithubIcon({ size = 13 }: { size?: number }) {
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
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
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
      className={`flex h-8 w-8 items-center justify-center rounded-xl transition-opacity hover:opacity-80 ${className}`}
    >
      {children}
    </a>
  );
}

const SOCIAL_BUTTONS = [
  {
    label: "X",
    href: socials[0].href,
    className: "bg-gray-100 text-gray-800",
    Icon: TwitterIcon,
  },
  {
    label: "LinkedIn",
    href: socials[1].href,
    className: "bg-blue-100 text-blue-600",
    Icon: LinkedinIcon,
  },
  {
    label: "GitHub",
    href: socials[2].href,
    className: "bg-orange-100 text-orange-500",
    Icon: GithubIcon,
  },
] as const;

const inputClassName =
  "min-w-0 flex-1 rounded-xl border border-gray-200 bg-transparent px-3 py-2.5 text-sm text-black placeholder-gray-400 transition focus:border-transparent focus:ring-2 focus:ring-gray-900 focus:outline-none";


type Status = "idle" | "sending" | "sent" | "error";

const mailtoHref = `mailto:${contactPage.email}?subject=${encodeURIComponent(contactPage.mailtoSubject)}`;

/**
 * Video contact landing at `/contact`. The form posts to `/api/contact`, which
 * emails the owner through Resend. Success is shown only after the server
 * confirms; on failure the visitor keeps their text and gets a mailto fallback.
 */
export default function FormaContactPage() {
  const [topics, setTopics] = useState<ContactTopic[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [company, setCompany] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const mountedAt = useRef<number | null>(null);

  useEffect(() => {
    mountedAt.current = performance.now();
  }, []);

  const toggleTopic = (topic: ContactTopic) => {
    setTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic],
    );
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (status === "sending" || status === "sent") return;
    setStatus("sending");
    setError("");

    const elapsedMs =
      mountedAt.current === null ? null : performance.now() - mountedAt.current;

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message, topics, company, elapsedMs }),
      });
      const data = (await response.json().catch(() => null)) as {
        ok?: boolean;
        message?: string;
      } | null;
      if (response.ok && data?.ok) {
        setStatus("sent");
        return;
      }
      setError(data?.message ?? contactMessages.failed);
    } catch {
      setError(contactMessages.failed);
    }
    setStatus("error");
  };

  return (
    <main
      id="main"
      className="forma-contact min-h-screen bg-white p-3 sm:p-4 md:p-6"
      style={{ fontFamily: "var(--font-inter-contact), Inter, sans-serif" }}
    >
      <div className="relative min-h-[calc(100vh-24px)] overflow-hidden rounded-2xl sm:min-h-[calc(100vh-32px)] sm:rounded-3xl md:min-h-[calc(100vh-48px)] lg:h-[calc(100vh-48px)]">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src={VIDEO_URL}
          autoPlay
          muted
          loop
          playsInline
        />

        <LandingTopNav
          wordmarkHref="/"
          resolveHref={expandHashHref}
          navId="contact-mobile-nav"
        />

        <div className="relative z-10 flex min-h-[calc(100vh-24px)] flex-col gap-6 p-4 pt-16 sm:min-h-[calc(100vh-32px)] sm:p-6 sm:pt-16 md:min-h-[calc(100vh-48px)] md:p-8 md:pt-16 lg:h-full">
          <div className="min-h-[2rem] flex-1" />

          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <p className="shrink-0 text-3xl leading-tight font-medium text-white drop-shadow-lg [text-shadow:0_1px_2px_rgb(0_0_0/0.55),0_2px_18px_rgb(0_0_0/0.45)] sm:text-4xl lg:max-w-lg xl:max-w-2xl xl:text-5xl">
              {contactPage.headlineLead}
              <br />
              {contactPage.headlineTail}{" "}
              <span
                style={{
                  fontFamily:
                    "var(--font-instrument-serif), 'Instrument Serif', serif",
                  fontStyle: "italic",
                  fontWeight: 400,
                }}
              >
                {contactPage.headlineAccent}
              </span>
            </p>

            <div className="w-full shrink-0 lg:w-[min(480px,45%)]">
              <div className="flex flex-col gap-4 overflow-hidden rounded-2xl bg-white p-4 shadow-2xl sm:rounded-3xl sm:p-6">
                <h1 className="text-xl font-semibold tracking-tight text-black sm:text-2xl">
                  {contactPage.cardTitle}
                </h1>

                {status === "sent" ? (
                  <div
                    role="status"
                    className="flex flex-col items-center gap-3 py-6 text-center"
                  >
                    <div
                      aria-hidden
                      className="flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-xl text-green-700"
                    >
                      ✓
                    </div>
                    <p className="text-base font-semibold text-gray-900">
                      {contactPage.successTitle}
                    </p>
                    <p className="text-sm text-gray-600">{contactPage.successBody}</p>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col items-start gap-2 rounded-2xl bg-gray-50 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                      <div className="min-w-0 max-w-full">
                        <p className="text-xs text-gray-600">{contactPage.directLabel}</p>
                        <a
                          href={mailtoHref}
                          className="block font-semibold break-all text-blue-700 transition-opacity hover:underline sm:truncate sm:break-normal"
                        >
                          {contactPage.email}
                        </a>
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5">
                        {SOCIAL_BUTTONS.map(({ label, href, className, Icon }) => (
                          <SocialBtn
                            key={label}
                            label={label}
                            href={href}
                            className={className}
                          >
                            <Icon size={13} />
                          </SocialBtn>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-3" aria-hidden>
                      <div className="h-px flex-1 bg-gray-200" />
                      <span className="text-sm font-medium text-gray-600">
                        {contactPage.divider}
                      </span>
                      <div className="h-px flex-1 bg-gray-200" />
                    </div>

                    <form className="flex flex-col gap-4" onSubmit={onSubmit}>
                      <p className="text-sm font-medium text-black">{contactPage.formLabel}</p>

                      <div className="flex flex-col gap-2 sm:flex-row">
                        <label htmlFor="contact-name" className="sr-only">
                          {contactPage.namePlaceholder}
                        </label>
                        <input
                          id="contact-name"
                          type="text"
                          name="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder={contactPage.namePlaceholder}
                          autoComplete="name"
                          maxLength={CONTACT_LIMITS.nameMax}
                          required
                          className={inputClassName}
                        />
                        <label htmlFor="contact-email" className="sr-only">
                          {contactPage.emailPlaceholder}
                        </label>
                        <input
                          id="contact-email"
                          type="email"
                          name="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder={contactPage.emailPlaceholder}
                          autoComplete="email"
                          maxLength={CONTACT_LIMITS.emailMax}
                          required
                          className={inputClassName}
                        />
                      </div>

                      <label htmlFor="contact-message" className="sr-only">
                        {contactPage.messagePlaceholder}
                      </label>
                      <textarea
                        id="contact-message"
                        name="message"
                        rows={4}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={contactPage.messagePlaceholder}
                        minLength={CONTACT_LIMITS.messageMin}
                        maxLength={CONTACT_LIMITS.messageMax}
                        required
                        className={`${inputClassName} resize-none`}
                      />

                      {/* Honeypot: hidden from people and assistive tech, tempting to bots. */}
                      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
                        <label htmlFor="contact-company">Company</label>
                        <input
                          id="contact-company"
                          type="text"
                          name="company"
                          tabIndex={-1}
                          autoComplete="off"
                          value={company}
                          onChange={(e) => setCompany(e.target.value)}
                        />
                      </div>

                      <fieldset className="flex flex-col gap-2">
                        <legend className="mb-2 text-sm font-medium text-black">
                          {contactPage.topicsLabel}
                        </legend>
                        <div className="flex flex-wrap gap-1.5">
                          {CONTACT_TOPICS.map((topic) => {
                            const active = topics.includes(topic);
                            return (
                              <button
                                key={topic}
                                type="button"
                                aria-pressed={active}
                                onClick={() => toggleTopic(topic)}
                                className={`rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                                  active
                                    ? "border-black bg-gray-100 text-black"
                                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-400"
                                }`}
                              >
                                {topic}
                              </button>
                            );
                          })}
                        </div>
                      </fieldset>

                      <div aria-live="polite" className="text-sm">
                        {status === "error" && error ? (
                          <p className="rounded-xl bg-red-50 px-3 py-2 text-red-800">
                            {error} {contactPage.errorFallbackLead}{" "}
                            <a href={mailtoHref} className="font-semibold underline">
                              {contactPage.email}
                            </a>
                            .
                          </p>
                        ) : null}
                      </div>

                      <button
                        type="submit"
                        disabled={status === "sending"}
                        className="w-full rounded-2xl bg-black py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:opacity-60"
                      >
                        {status === "sending" ? contactPage.sending : contactPage.submit}
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
