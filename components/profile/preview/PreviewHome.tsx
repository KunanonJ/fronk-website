import { EyebrowRow } from "@/components/ds/labels";
import { TextLink } from "@/components/ds/TextLink";

/** /preview: an empty shell until Phase 1 brings the chrome and sections. */
export default function PreviewHome() {
  return (
    <div className="ds-wrap flex flex-col gap-6 pb-24 pt-12">
      <EyebrowRow>Phase 0</EyebrowRow>
      <h1 className="t-display">Profile preview</h1>
      <p className="t-lead max-w-[34em] text-ink-80">
        The new Home is built here, section by section, before it goes live. The
        tokens and primitives are on the system page.
      </p>
      <TextLink href="/preview/system">Design system preview</TextLink>
    </div>
  );
}
