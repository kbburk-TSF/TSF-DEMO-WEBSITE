// pages/plasmic-host.jsx

import * as React from 'react';
import { PlasmicCanvasHost, registerComponent } from '@plasmicapp/react-web/lib/host';
import DashboardBlock from '../components/DashboardBlock';

// Register the full dashboard block (selector + 3-over-1 charts)
// No other edits required.
registerComponent(DashboardBlock, {
  name: 'DashboardBlock',
  importPath: '../components/DashboardBlock', // no .jsx needed
  importName: 'default',
  props: {
    width: { type: 'number', defaultValue: 1200 },
    topHeight: { type: 'number', defaultValue: 220 },
    bottomHeight: { type: 'number', defaultValue: 360 },
    // seriesList and rows are optional; leave unset to use built-in demo data
    seriesList: { type: 'object' },
    rows: { type: 'object' }
  }
});

export default function PlasmicHost() {
  return <PlasmicCanvasHost />;
}
