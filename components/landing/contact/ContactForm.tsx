import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { revalidateLogic, useForm, useStore } from "@tanstack/react-form";
import { CheckIcon } from "@/components/bento/icons";
import { pillClass } from "@/components/ds/Pill";
import type { ContactIntent } from "@/lib/contact/search";
import {
  CONTACT_LIMITS,
  CONTACT_TOPICS,
  HIRING_TOPIC,
  contactPage,
} from "@/lib/content/contact";
import {
  contactFormSchema,
  firstContactIssue,
  type ContactFormValues,
} from "@/lib/contact/schema";
import { composeContactEmail, type ContactEmail } from "@/lib/contact/compose";
import { onContactDraft } from "@/lib/agents/contactDraft";
import { writeClipboard } from "@/lib/utils/clipboard";
import { cn } from "@/lib/utils/cn";

type Copy = "idle" | "copied" | "failed";

export const contactMailto = `mailto:${contactPage.email}?subject=${encodeURIComponent(contactPage.mailtoSubject)}`;

const EMPTY: ContactFormValues = { name: "", message: "", topics: [] };

const COPY_RESET_MS = 2000;

/** Opens a mailto: link the way a click on it would: the email app takes it. */
function openEmail(href: string) {
  const link = document.createElement("a");
  link.href = href;
  link.click();
}

// The profile redesign's mono label (design spec 3.2): 12 px, uppercase.
const LABEL = "t-meta text-ink-60";
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
 * The "Say hello" card (profile redesign, Phase 6 cutover; the bento canvas
 * before it, design spec 4.3 and gap 21). The form prepares an email to the
 * public address and opens it in the visitor's own email app
 * (lib/contact/compose.ts): the site sends nothing and keeps nothing, so it
 * needs no mail server, spam check or secrets.
 *
 * - Validation: the shared Valibot schema runs on submit, then on every
 *   change once a submit has been tried. Errors show under each field and
 *   the first invalid field takes focus.
 * - Ready: after the button, a status panel says the email is in the
 *   visitor's app, offers to open it again or copy it (a browser with no
 *   email app opens nothing), and focus moves to it.
 * - Intent: `hiring` (from `/contact?topic=hiring`) chooses the Hiring topic
 *   on arrival and again after "Write another message". It only ever adds
 *   the topic: the chips stay the visitor's to change.
 * - Prompt: the message label follows the Hiring chip, not the URL, so it
 *   asks about the role exactly while Hiring is chosen.
 */
export default function ContactForm({
  intent = "general",
}: {
  intent?: ContactIntent;
}) {
  const [ready, setReady] = useState<ContactEmail | null>(null);
  const [copy, setCopy] = useState<Copy>("idle");
  const readyRef = useRef<HTMLDivElement>(null);
  const copyAreaRef = useRef<HTMLTextAreaElement>(null);
  const focusNameNext = useRef(false);
  const copyTimer = useRef<number | undefined>(undefined);

  // The form gives way to the ready panel, so focus follows it; after
  // "Write another message" it returns to the first field.
  useEffect(() => {
    if (ready) readyRef.current?.focus();
    else if (focusNameNext.current) {
      focusNameNext.current = false;
      document.getElementById("contact-name")?.focus();
    }
  }, [ready]);
  useEffect(() => () => window.clearTimeout(copyTimer.current), []);
  // A refused copy hands the visitor the email, focused and selected, so
  // its label is read out and one keypress copies it: once it appears, and
  // again on each later refusal.
  const selectCopyArea = useCallback(() => {
    copyAreaRef.current?.focus();
    copyAreaRef.current?.select();
  }, []);
  useEffect(() => {
    if (copy === "failed") selectCopyArea();
  }, [copy, selectCopyArea]);

  const form = useForm({
    defaultValues: EMPTY,
    validationLogic: revalidateLogic(),
    validators: { onDynamic: contactFormSchema },
    onSubmitInvalid: ({ value }) => {
      const issue = firstContactIssue(value);
      if (issue) document.getElementById(`contact-${issue.field}`)?.focus();
    },
    onSubmit: ({ value }) => {
      const email = composeContactEmail(value);
      setCopy("idle");
      setReady(email);
      // Too long for an email link: the panel asks for a copy first.
      if (email.complete) openEmail(email.href);
    },
  });

  // The page is prerendered with the general form, so the intent arrives
  // after hydration: choose Hiring then, without touching other choices.
  const hiring = intent === "hiring";
  const chooseHiring = useCallback(() => {
    form.setFieldValue("topics", (topics) =>
      topics.includes(HIRING_TOPIC) ? topics : [HIRING_TOPIC, ...topics],
    );
  }, [form]);
  useEffect(() => {
    if (hiring) chooseHiring();
  }, [hiring, chooseHiring]);

  // What the message field asks follows the chip the visitor sees pressed.
  const hiringChosen = useStore(form.store, (state) =>
    state.values.topics.includes(HIRING_TOPIC),
  );

  // A WebMCP agent's draft (draft_contact_message, lib/agents/webmcp.ts)
  // fills the fields, and the focus moves to the button, which the visitor
  // presses after reviewing it.
  useEffect(
    () =>
      onContactDraft((draft) => {
        setReady(null);
        form.setFieldValue("name", draft.name);
        form.setFieldValue("message", draft.message);
        if (draft.topics) form.setFieldValue("topics", [...draft.topics]);
        requestAnimationFrame(() =>
          document.getElementById("contact-send")?.focus(),
        );
      }),
    [form],
  );

  const copyMessage = (email: ContactEmail) => {
    const text = `To: ${email.to}\nSubject: ${email.subject}\n\n${email.body}`;
    void writeClipboard(text).then((ok) => {
      if (!ok) selectCopyArea();
      setCopy(ok ? "copied" : "failed");
      window.clearTimeout(copyTimer.current);
      if (ok) {
        copyTimer.current = window.setTimeout(
          () => setCopy("idle"),
          COPY_RESET_MS,
        );
      }
    });
  };

  return (
    <article
      id={contactPage.formId}
      aria-labelledby="card-form"
      className="ds-tile ds-tile--paper pf-contact__form"
    >
      <h2 id="card-form" className="t-h3 pf-contact__title">
        {contactPage.cardTitle}
      </h2>
      {ready ? (
        <div className="my-auto flex flex-col items-start gap-5 px-1 pb-6">
          <div
            ref={readyRef}
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
              {ready.complete ? contactPage.readyTitle : contactPage.longTitle}
            </p>
            <p className="m-0 text-base leading-[1.55] text-ink-2">
              {ready.complete ? contactPage.readyBody : contactPage.longBody}
            </p>
            <p className="m-0 text-sm leading-normal text-ink-2">
              {ready.complete
                ? contactPage.readyFallback
                : contactPage.longFallback}{" "}
              <span className="font-semibold text-ink select-all">
                {ready.to}
              </span>
              .
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <a
              id="contact-open"
              href={ready.href}
              className={pillClass({
                variant: ready.complete ? "dark" : "ghost",
                size: "lg",
              })}
            >
              {ready.complete ? contactPage.openAgain : contactPage.openApp}
            </a>
            <button
              type="button"
              onClick={() => copyMessage(ready)}
              className={pillClass({
                variant: ready.complete ? "ghost" : "dark",
                size: "lg",
              })}
            >
              <span aria-live="polite">
                {copy === "copied"
                  ? contactPage.messageCopied
                  : contactPage.copyMessage}
              </span>
            </button>
            <button
              type="button"
              onClick={() => {
                form.reset();
                // A recruiter who writes again is still a recruiter.
                if (hiring) chooseHiring();
                focusNameNext.current = true;
                setReady(null);
              }}
              className="inline-flex h-12 items-center rounded-full border border-hairline-strong bg-surface px-[22px] text-card font-medium text-ink"
            >
              {contactPage.writeAnother}
            </button>
          </div>
          {copy === "failed" ? (
            // The clipboard refused: the email, to copy by hand.
            <div className="flex w-full flex-col gap-2">
              <label
                htmlFor="contact-copy"
                className="text-sm leading-normal text-ink-2"
              >
                {contactPage.copyFailed}
              </label>
              <textarea
                id="contact-copy"
                ref={copyAreaRef}
                readOnly
                rows={6}
                value={`To: ${ready.to}\nSubject: ${ready.subject}\n\n${ready.body}`}
                className={cn(INPUT, "py-3 leading-normal")}
              />
            </div>
          ) : null}
        </div>
      ) : (
        <form
          aria-labelledby="card-form"
          noValidate
          className="m-0 flex flex-col gap-5 px-1 pt-1"
          onSubmit={(e) => {
            e.preventDefault();
            void form.handleSubmit();
          }}
        >
          <p className="m-0 text-card font-medium">{contactPage.formLabel}</p>

          <form.Field name="name">
            {(field) => {
              const fieldError = errorText(field.state.meta.errors);
              return (
                <Field
                  id="contact-name"
                  label={contactPage.namePlaceholder}
                  error={fieldError}
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

          <form.Field name="message">
            {(field) => {
              const fieldError = errorText(field.state.meta.errors);
              return (
                <Field
                  id="contact-message"
                  label={
                    hiringChosen
                      ? contactPage.hiringPlaceholder
                      : contactPage.messagePlaceholder
                  }
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

          <div className="flex flex-col items-start gap-3">
            <button
              id="contact-send"
              type="submit"
              aria-describedby="contact-note"
              className={pillClass({ variant: "dark", size: "lg" })}
            >
              {contactPage.submit}
            </button>
            <p
              id="contact-note"
              className="m-0 text-sm leading-normal text-ink-2"
            >
              {contactPage.formNote}
            </p>
          </div>
        </form>
      )}
    </article>
  );
}
