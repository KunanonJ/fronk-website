"use client";

import { useId, useState, type FormEvent } from "react";
import { ArrowRight } from "lucide-react";
import { track } from "@/lib/analytics/gtag";
import { cn } from "@/lib/utils/cn";

type Status = "idle" | "loading" | "success" | "error";

/**
 * Journal newsletter signup. Posts to /api/subscribe (which adds the address to
 * the Resend audience), with idle/loading/success/error states and an aria-live
 * status line. Fires a `newsletter_subscribe` GA event on success.
 */
export function NewsletterSignup() {
  const inputId = useId();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "loading") return;
    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        message?: string;
      };

      if (response.ok) {
        setStatus("success");
        setMessage(data.message ?? "You're in.");
        setEmail("");
        track("newsletter_subscribe", { location: "writing" });
      } else {
        setStatus("error");
        setMessage(data.message ?? "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  }

  const done = status === "success";

  return (
    <section
      aria-labelledby="newsletter-heading"
      className="panel panel-live mt-16 p-8 sm:p-10"
    >
      <p className="label-mono text-subtle">Subscribe</p>
      <h2
        id="newsletter-heading"
        className="mt-3 font-display text-2xl font-semibold tracking-tight sm:text-3xl"
      >
        New posts, in your inbox.
      </h2>
      <p className="mt-3 max-w-md text-muted">
        Working notes on building, hiring, and shipping — roughly once a week. No
        spam, unsubscribe anytime.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-6 flex flex-col gap-3 sm:flex-row"
        noValidate
      >
        <label htmlFor={inputId} className="sr-only">
          Email address
        </label>
        <input
          id={inputId}
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="you@domain.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={status === "loading" || done}
          aria-invalid={status === "error"}
          className="h-11 flex-1 border border-border bg-surface px-4 font-mono text-sm text-fg transition-colors placeholder:text-subtle focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
        />
        <button
          type="submit"
          disabled={status === "loading" || done}
          className="inline-flex h-11 items-center justify-center gap-2 border border-accent/55 px-5 font-mono text-xs uppercase tracking-wider text-accent transition-[color,background-color,border-color,transform] hover:border-accent hover:bg-accent/10 active:translate-y-px active:bg-accent/15 disabled:pointer-events-none disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
        >
          {status === "loading"
            ? "Subscribing…"
            : done
              ? "Subscribed"
              : "Subscribe"}
          {!done ? <ArrowRight className="h-4 w-4" /> : null}
        </button>
      </form>

      <p
        aria-live="polite"
        className={cn(
          "mt-3 min-h-[1.25rem] text-sm",
          status === "success" && "text-accent",
          status === "error" && "text-neg",
          (status === "idle" || status === "loading") && "text-muted",
        )}
      >
        {message}
      </p>
    </section>
  );
}
