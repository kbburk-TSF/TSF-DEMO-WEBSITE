// plasmic-host.jsx
import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { PlasmicCanvasHost, registerComponent } from "@plasmicapp/react-web/lib/host";
import TwoChartEngine from "./components/TwoChartEngine.jsx";

registerComponent(TwoChartEngine, {
  name: "TwoChartEngine",
  props: {},
});

function App() {
  return <PlasmicCanvasHost />;
}

const rootEl = document.getElementById("root");
if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);
  root.render(<App />);
}

export default App;
