// pages/plasmic-host.jsx

import * as React from 'react';
import { PlasmicCanvasHost, registerComponent } from '@plasmicapp/react-web/lib/host';
import ThreeChartsBlock from '../components/ThreeChartsBlock';

registerComponent(ThreeChartsBlock, {
  name: 'ThreeChartsBlock',
  importPath: 'components/ThreeChartsBlock', // <- required by Plasmic
  defaultExport: true,
  props: {
    rows: 'object',
    width: { type: 'number', defaultValue: 1200 },
    height: { type: 'number', defaultValue: 260 }
  }
});

export default function PlasmicHost() {
  return <PlasmicCanvasHost />;
}
