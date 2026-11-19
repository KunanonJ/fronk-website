import type { ContactTopic } from "@/lib/content/contact";

/**
 * A bridge from the WebMCP draft_contact_message tool to the contact form:
 * the form, while it is on screen, takes a draft into its own fields. The
 * visitor reviews it, and the form's button opens it in their email app.
 */
export interface ContactDraft {
  name: string;
  message: string;
  /** The "What's it about?" chips to choose; the form's own stay otherwise. */
  topics?: readonly ContactTopic[];
}

type DraftHandler = (draft: ContactDraft) => void;

let handler: DraftHandler | null = null;

/** The contact form takes drafts while mounted; call the result to stop. */
export function onContactDraft(next: DraftHandler): () => void {
  handler = next;
  return () => {
    if (handler === next) handler = null;
  };
}

/** Hands a draft to the contact form; false when no form is on screen. */
export function fillContactDraft(draft: ContactDraft): boolean {
  if (!handler) return false;
  handler(draft);
  return true;
}
