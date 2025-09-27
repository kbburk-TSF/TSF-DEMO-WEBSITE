// pages/plasmic-host.jsx
// Uses the proper Plasmic Host API so `meta.importPath` is not required.
import { PlasmicCanvasHost, registerComponent } from "@plasmicapp/host";
import TwoChartEngine from "../components/TwoChartEngine.jsx";

registerComponent(TwoChartEngine, {
  name: "TwoChartEngine",
  props: {},
});

export default function PlasmicHost() {
  return <PlasmicCanvasHost />;
}
