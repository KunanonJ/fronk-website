import * as v from "valibot";
import {
  CONTACT_LIMITS,
  CONTACT_TOPICS,
  contactMessages,
} from "@/lib/content/contact";
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

/**
 * The first problem with a submission, in form order (name, email,
 * message), worded for the visitor; null when the values are valid. The
 * form focuses `field` (its input id is `contact-<field>`).
 */
export function firstContactIssue(
  values: unknown,
): { field: string; message: string } | null {
  const result = v.safeParse(contactFormSchema, values);
  if (result.success) return null;
  const issue = result.issues[0];
  return issue
    ? { field: v.getDotPath(issue) ?? "", message: issue.message }
    : null;
}
