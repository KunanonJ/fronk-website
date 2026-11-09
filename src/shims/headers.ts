/*
 * `next/headers` in the Start build (tanstack-migration). Draft mode is gone
 * (owner decision), so it is always off; nothing else from next/headers is
 * used by modules the Start routes import.
 */
export async function draftMode() {
  return { isEnabled: false, enable() {}, disable() {} };
}
