import { ArrowDown } from "lucide-react";
import { Fragment } from "react";
import VisualIcon from "@/components/landing/portfolio/VisualIcon";
import type { PortfolioArchitecture as Architecture } from "@/lib/content/portfolio";

const serif = {
  fontFamily: "var(--font-instrument-serif), 'Instrument Serif', serif",
} as const;

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
        className="mb-6 text-2xl font-medium text-primary sm:text-3xl"
        style={serif}
      >
        Architecture
      </h2>

      <ol className="flex flex-col" aria-label="Layers, top to bottom">
        {layers.map((layer, index) => (
          <Fragment key={layer.label}>
            <li className="grid gap-3 rounded-2xl border border-primary/12 bg-primary/[0.03] p-4 sm:grid-cols-[9rem_minmax(0,1fr)] sm:items-center sm:gap-5 sm:p-5">
              <h3 className="text-[10px] uppercase tracking-[0.16em] text-primary/75 sm:text-xs">
                {layer.label}
              </h3>
              <ul className="flex flex-wrap gap-2">
                {layer.nodes.map((node) => (
                  <li
                    key={node.label}
                    className="flex items-center gap-2.5 rounded-xl border border-primary/15 bg-surface px-3 py-2"
                  >
                    {node.icon ? (
                      <VisualIcon id={node.icon} className="h-4 w-4 text-primary" />
                    ) : null}
                    <span className="flex flex-col">
                      <span className="text-sm text-primary">{node.label}</span>
                      {node.note ? (
                        <span className="text-xs text-primary/75">{node.note}</span>
                      ) : null}
                    </span>
                  </li>
                ))}
              </ul>
            </li>
            {index < layers.length - 1 ? (
              <li aria-hidden="true" className="flex justify-center py-1.5 text-primary/50">
                <ArrowDown className="h-4 w-4" />
              </li>
            ) : null}
          </Fragment>
        ))}
      </ol>
    </section>
  );
}
