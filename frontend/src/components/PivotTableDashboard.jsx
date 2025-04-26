// src/components/PivotTableDashboard.jsx
import React, { useState } from "react";
import "react-pivottable/pivottable.css";
import PivotTableUI from "react-pivottable/PivotTableUI";
import TableRenderers from "react-pivottable/TableRenderers";

function PivotTableDashboard({ data }) {
  const [pivotState, setPivotState] = useState({ data });
  return (
    <div className="mt-6 bg-white p-6 rounded shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Interactive Data Analysis</h2>
      <PivotTableUI
        data={data}
        onChange={(s) => setPivotState(s)}
        renderers={TableRenderers}
        {...pivotState}
      />
    </div>
  );
}

export default PivotTableDashboard;