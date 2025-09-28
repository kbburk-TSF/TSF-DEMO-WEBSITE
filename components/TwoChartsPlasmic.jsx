// components/TwoChartsPlasmic.jsx
import React from "react";
import TwoCharts from "../src/tabs/TwoCharts.jsx";

export default function TwoChartsPlasmic() {
  // Width 100% so the Plasmic box can size horizontally;
  // Height is intrinsic — expands automatically as charts populate.
  return (
    <div style={{ width: "100%", display: "block" }}>
      <TwoCharts />
    </div>
  );
}
