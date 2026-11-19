/**
 * A bridge from the WebMCP draft_contact_message tool to the contact form:
 * the form, while it is on screen, takes a draft into its own fields. Only
 * the visible fields; the visitor reviews the draft and presses Send.
 */
export interface ContactDraft {
  name: string;
  email: string;
  message: string;
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
