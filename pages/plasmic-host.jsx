// pages/plasmic-host.jsx
import * as React from "react";
import { PlasmicCanvasHost, registerComponent } from "@plasmicapp/react-web/lib/host";
import TwoChartsPlasmic from "../components/TwoChartsPlasmic.jsx";

registerComponent(TwoChartsPlasmic, {
  name: "TwoChartsPlasmic",
  importPath: "./components/TwoChartsPlasmic",
  isDefaultExport: true,
  props: {},
});

export default function PlasmicHost() {
  return <PlasmicCanvasHost />;
}
