"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";

interface ContactFormProps {
  email: string;
}

type Status = "idle" | "success" | "error";

/**
 * Lightweight contact form — opens mailto on submit with success/error UI.
 * No backend API in repo; validates client-side then uses mailto.
 */
export function ContactForm({ email }: ContactFormProps) {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name.trim() || !message.trim()) {
      setStatus("error");
      return;
    }
    try {
      const subject = encodeURIComponent(`Hello from ${name.trim()}`);
      const body = encodeURIComponent(message.trim());
      window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  const fieldClass =
    "mt-2 w-full rounded-xl border border-border bg-surface px-4 py-3 text-fg outline-none transition-[border-color] focus-visible:border-border-strong focus-visible:ring-2 focus-visible:ring-accent";

  return (
    <form onSubmit={onSubmit} className="mt-12 max-w-xl space-y-6" noValidate>
      <div>
        <label htmlFor="contact-name" className="block text-sm text-fg">
          Name
        </label>
        <input
          id="contact-name"
          name="name"
          autoComplete="name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setStatus("idle");
          }}
          className={fieldClass}
        />
      </div>
      <div>
        <label htmlFor="contact-message" className="block text-sm text-fg">
          Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={5}
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            setStatus("idle");
          }}
          className={`${fieldClass} resize-y`}
        />
      </div>
      <Button type="submit" size="lg">
        Send message
      </Button>
      {status === "success" ? (
        <p role="status" className="text-sm text-pos">
          Opening your email client…
        </p>
      ) : null}
      {status === "error" ? (
        <p role="alert" className="text-sm text-neg">
          Please add your name and a short message, then try again.
        </p>
      ) : null}
    </form>
  );
}
