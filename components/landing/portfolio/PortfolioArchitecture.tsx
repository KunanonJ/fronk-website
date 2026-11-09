import { ArrowDown } from "lucide-react";
import { Fragment } from "react";
import VisualIcon from "@/components/landing/portfolio/VisualIcon";
import type { PortfolioArchitecture as Architecture } from "@/lib/content/portfolio";

type PortfolioArchitectureProps = {
  architecture: Architecture;
  headingId: string;
};

/**
 * Layered diagram, top to bottom: each layer is a labelled row of component
 * chips, joined by down-arrows. Layers are an ordered list so the reading
 * order matches the visual flow.
 */
export default function PortfolioArchitecture({
  architecture,
  headingId,
}: PortfolioArchitectureProps) {
  const { layers } = architecture;

  return (
    <section aria-labelledby={headingId}>
      <h2
        id={headingId}
        className="mb-6 font-display text-h3 text-ink"
      >
        Architecture
      </h2>

      <ol className="flex flex-col" aria-label="Layers, top to bottom">
        {layers.map((layer, index) => (
          <Fragment key={layer.label}>
            <li className="grid gap-3 rounded-2xl border border-hairline bg-surface-tint p-4 sm:grid-cols-[9rem_minmax(0,1fr)] sm:items-center sm:gap-5 sm:p-5">
              <h3 className="font-mono text-label uppercase text-ink-2">
                {layer.label}
              </h3>
              <ul className="flex flex-wrap gap-2">
                {layer.nodes.map((node) => (
                  <li
                    key={node.label}
                    className="flex items-center gap-2.5 rounded-xl border border-hairline-strong bg-surface px-3 py-2"
                  >
                    {node.icon ? (
                      <VisualIcon id={node.icon} className="h-4 w-4 text-ink" />
                    ) : null}
                    <span className="flex flex-col">
                      <span className="text-sm text-ink">{node.label}</span>
                      {node.note ? (
                        <span className="text-xs text-ink-2">{node.note}</span>
                      ) : null}
                    </span>
                  </li>
                ))}
              </ul>
            </li>
            {index < layers.length - 1 ? (
              <li aria-hidden="true" className="flex justify-center py-1.5 text-ink-2">
                <ArrowDown className="h-4 w-4" />
              </li>
            ) : null}
          </Fragment>
        ))}
      </ol>
    </section>
  );
}
