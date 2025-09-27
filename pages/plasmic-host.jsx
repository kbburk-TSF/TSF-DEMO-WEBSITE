// pages/plasmic-host.jsx

import * as React from 'react';
import { PlasmicCanvasHost, registerComponent } from '@plasmicapp/react-web/lib/host';
import ThreeChartsBlock from '../components/ThreeChartsBlock';

// Register your code component exactly once (no duplicate imports)
registerComponent(ThreeChartsBlock, {
  name: 'ThreeChartsBlock',
  props: {
    rows: 'object',
    width: { type: 'number', defaultValue: 1200 },
    height: { type: 'number', defaultValue: 260 },
  },
});

export default function PlasmicHost() {
  return <PlasmicCanvasHost />;
}
