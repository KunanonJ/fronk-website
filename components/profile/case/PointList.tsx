import { PixelMark } from "@/components/ds/labels";

/*
 * A point list (profile redesign Phase 5, design spec 9.8): what the project
 * does, each point after a pixel bullet. Styles: `.pf-case-points*`.
 */
export function PointList({ items }: { items: readonly string[] }) {
  return (
    <ul className="pf-case-points">
      {items.map((item) => (
        <li key={item} className="pf-case-points__item">
          <PixelMark kind="bullet" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
