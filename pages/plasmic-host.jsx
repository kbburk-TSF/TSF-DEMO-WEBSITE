// pages/plasmic-host.jsx
import * as React from 'react';
import { PlasmicCanvasHost, registerComponent } from '@plasmicapp/react-web/lib/host';

// Import your two components (kept exactly as provided)
import DashboardTab from '../components/DashboardTab';
import DashboardTab2 from '../components/DashboardTab2';

// Register both so they appear in Plasmic Studio (⌘K search / Insert)
registerComponent(DashboardTab, {
  name: 'DashboardTab',
  importPath: '../components/DashboardTab',
  importName: 'default',
  props: {}
});

registerComponent(DashboardTab2, {
  name: 'DashboardTab2',
  importPath: '../components/DashboardTab2',
  importName: 'default',
  props: {}
});

export default function PlasmicHost() {
  return <PlasmicCanvasHost />;
}
