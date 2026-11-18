import type { PortfolioArchitecture } from "@/lib/content/portfolio";

/*
 * The architecture (profile redesign Phase 5, design spec 15.7): its layers
 * top to bottom, each a row with its name and its parts as chips, a part's
 * note after a middle dot. Styles: `.pf-case-layers*` in case.css.
 */
export function CaseLayers({
  label,
  layers,
}: {
  label: string;
  layers: PortfolioArchitecture["layers"];
}) {
  return (
    <ol aria-label={label} className="pf-case-layers">
      {layers.map((layer) => (
        <li key={layer.label} className="pf-case-layers__layer">
          <h3 className="t-meta pf-case-layers__name">{layer.label}</h3>
          <ul className="pf-case-layers__nodes">
            {layer.nodes.map((node) => (
              <li key={node.label} className="pf-case-layers__node">
                <span className="pf-case-layers__node-name">{node.label}</span>
                {node.note ? (
                  <span className="pf-case-layers__note"> · {node.note}</span>
                ) : null}
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ol>
  );
}
