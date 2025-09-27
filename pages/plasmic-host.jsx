// pages/plasmic-host.jsx
import * as React from 'react';
import { PlasmicCanvasHost, registerComponent } from '@plasmicapp/react-web/lib/host';

import { DashboardTab } from '../components/DashboardTab';
import { DashboardTab2 } from '../components/DashboardTab2';

registerComponent(DashboardTab, {
  name: "DashboardTab",
  importPath: "../components/DashboardTab",
  importName: "DashboardTab",
  props: {}
});

registerComponent(DashboardTab2, {
  name: "DashboardTab2",
  importPath: "../components/DashboardTab2",
  importName: "DashboardTab2",
  props: {}
});

export default function PlasmicHost() {
  return <PlasmicCanvasHost />;
}
