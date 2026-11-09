/** GROQ template tag: joins the template, so queries stay plain strings (and editors can highlight them). */
export function groq(strings: TemplateStringsArray, ...keys: unknown[]): string {
  const last = strings.length - 1;
  return strings.slice(0, last).reduce((acc, str, i) => acc + str + String(keys[i]), "") + strings[last];
}
