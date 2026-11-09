// Pragmatic email shape check: one local part, one domain with a TLD. Not a
// full RFC validator (those reject valid addresses); the real confirmation is
// the reply email.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_PATTERN.test(email.trim());
}
