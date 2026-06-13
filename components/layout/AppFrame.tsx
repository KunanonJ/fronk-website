import { CornerTicks } from "@/components/ui/CornerTicks";

/**
 * Fixed hairline window-frame with brighter corner crop-marks — the matveyan
 * "instrument bezel" that frames the whole viewport. Decorative and
 * non-interactive; hidden in print (`data-site-chrome`).
 */
export function AppFrame() {
  return (
    <div data-site-chrome aria-hidden className="frame-hud">
      <CornerTicks size={12} className="text-fg/45" />
    </div>
  );
}
