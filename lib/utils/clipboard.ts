/**
 * Copies text to the clipboard: the async Clipboard API in a secure context,
 * else the legacy hidden-textarea path. Resolves false when both fail.
 */
export async function writeClipboard(value: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {
    // Fall through to the legacy path (permissions, older browsers).
  }
  const area = document.createElement("textarea");
  try {
    area.value = value;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    // Never leave the hidden copy in the page, even when the copy throws.
    area.remove();
  }
}
