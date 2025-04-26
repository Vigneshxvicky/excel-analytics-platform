// src/components/PivotTableDashboard.jsx
import React, { useState } from 'react';
import 'react-pivottable/pivottable.css'; // Import the default pivot table styles
import PivotTableUI from 'react-pivottable/PivotTableUI';
import TableRenderers from 'react-pivottable/TableRenderers';

function PivotTableDashboard({ data }) {
  // Store pivot table state. This state will also store the current pivot configuration.
  const [pivotState, setPivotState] = useState({ data: data });
  
  return (
    <div style={{ marginTop: '20px' }}>
      <h2>Interactive Data Analysis</h2>
      <PivotTableUI
        data={data}
        onChange={s => setPivotState(s)}
        renderers={TableRenderers}
        {...pivotState}
      />
      {/* You can add additional drill-down or filtering logic here */}
    </div>
  );
}

export default PivotTableDashboard;