import * as v from "valibot";
import { CONTACT_LIMITS, CONTACT_TOPICS, contactMessages } from "@/lib/content/contact";
import { isValidEmail } from "@/lib/contact/email";

/**
 * The contact form's rules as a Valibot schema (Standard Schema), so the form
 * and any server validation share one definition. Mirrors `validate()` in
 * sendContactMessage.ts, which stays the server's source of truth.
 */
const trimmed = v.pipe(v.string(), v.trim());

export const contactFormSchema = v.object({
  name: v.pipe(
    trimmed,
    v.nonEmpty(contactMessages.invalidName),
    v.maxLength(CONTACT_LIMITS.nameMax, contactMessages.invalidName),
  ),
  email: v.pipe(
    trimmed,
    v.maxLength(CONTACT_LIMITS.emailMax, contactMessages.invalidEmail),
    v.check(isValidEmail, contactMessages.invalidEmail),
  ),
  message: v.pipe(
    trimmed,
    v.minLength(CONTACT_LIMITS.messageMin, contactMessages.messageTooShort),
    v.maxLength(CONTACT_LIMITS.messageMax, contactMessages.messageTooLong),
  ),
  topics: v.array(v.picklist(CONTACT_TOPICS)),
  company: v.string(),
});

export type ContactFormValues = v.InferInput<typeof contactFormSchema>;

/** The first problem with a submission, worded for the visitor, or null. */
export function firstContactError(values: unknown): string | null {
  const result = v.safeParse(contactFormSchema, values);
  return result.success ? null : (result.issues[0]?.message ?? contactMessages.failed);
}
