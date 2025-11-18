// src/layouts/monthlysales/index.js
import React, { useMemo, useState } from "react";
import Grid from "@mui/material/Grid";
import MDBox from "components/MDBox";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import EditableTable from "../../../layouts/analysis/data/edittable";
import AnalysisTabs from "examples/Tabs/AnalysisTabs";

function MonthlySalesTab() {
  const initialRows = Array(12).fill({
    month: "",
    revenue: "",
    cost: "",
    profit: "",
  });

  const [rows, setRows] = useState(initialRows);

  const columns = useMemo(
    () => [
      { header: "월", accessorKey: "month", size: 100 },
      { header: "매출", accessorKey: "revenue", size: 120 },
      { header: "원가", accessorKey: "cost", size: 120 },
      { header: "손익", accessorKey: "profit", size: 120 },
    ],
    []
  );

  return (
    <MDBox pt={4} pb={3}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <EditableTable rows={rows} setRows={setRows} columns={columns} title="월별 매출 분석" />
        </Grid>
      </Grid>
    </MDBox>
  );
}

export default MonthlySalesTab;
