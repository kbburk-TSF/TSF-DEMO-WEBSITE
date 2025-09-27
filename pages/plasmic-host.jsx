// pages/plasmic-host.jsx
import * as React from 'react';
import { PlasmicCanvasHost, registerComponent } from '@plasmicapp/react-web/lib/host';

import DashboardTab from '../components/DashboardTab';
import DashboardTab2 from '../components/DashboardTab2';

registerComponent(DashboardTab, { name: "DashboardTab" });
registerComponent(DashboardTab2, { name: "DashboardTab2" });

export default function PlasmicHost() {
  return <PlasmicCanvasHost />;
}
