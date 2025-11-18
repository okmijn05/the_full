// src/layouts/investment/index.js
import React, { useMemo, useState } from "react";
import Grid from "@mui/material/Grid";
import MDBox from "components/MDBox";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import EditableTable from "../../../layouts/analysis/data/edittable";
import AnalysisTabs from "examples/Tabs/AnalysisTabs";

function InvestmentTab() {
  const initialRows = Array(10).fill({
    item: "",
    cost: "",
    note: "",
  });

  const [rows, setRows] = useState(initialRows);

  const columns = useMemo(
    () => [
      { header: "항목", accessorKey: "item", size: 150 },
      { header: "투자비용", accessorKey: "cost", size: 120 },
      { header: "비고", accessorKey: "note", size: 150 },
    ],
    []
  );

  return (
    <MDBox pt={4} pb={3}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <EditableTable rows={rows} setRows={setRows} columns={columns} title="투자비용 분석" />
        </Grid>
      </Grid>
    </MDBox>
  );
}

export default InvestmentTab;
