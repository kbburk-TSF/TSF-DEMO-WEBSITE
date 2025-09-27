// pages/plasmic-host.jsx

import * as React from 'react';
import { PlasmicCanvasHost, registerComponent } from '@plasmicapp/host';
import ThreeChartsBlock from '../components/ThreeChartsBlock';

// Register exactly once. For Codegen projects, importPath MUST be a string.
registerComponent(ThreeChartsBlock, {
  name: 'ThreeChartsBlock',
  importPath: '../components/ThreeChartsBlock', // no .jsx needed
  importName: 'default',
  props: {
    rows: { type: 'object' },
    width: { type: 'number', defaultValue: 1200 },
    height: { type: 'number', defaultValue: 260 },
  },
});

export default function PlasmicHost() {
  return <PlasmicCanvasHost />;
}
