// pages/plasmic-host.jsx
import * as React from "react";
import { PlasmicCanvasHost, registerComponent } from "@plasmicapp/react-web/lib/host";
import TwoChartEngine from "../components/TwoChartEngine.jsx";

registerComponent(TwoChartEngine, {
  name: "TwoChartEngine",
  importPath: "./components/TwoChartEngine",
  isDefaultExport: true,
  props: {},
});

export default function PlasmicHost() {
  return <PlasmicCanvasHost />;
}
