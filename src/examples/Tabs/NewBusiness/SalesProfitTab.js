// src/layouts/salesprofit/index.js
import React, { useMemo, useState } from "react";
import Grid from "@mui/material/Grid";
import MDBox from "components/MDBox";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import EditableTable from "../../../layouts/analysis/data/edittable";
import AnalysisTabs from "examples/Tabs/AnalysisTabs";

function SalesProfitTab() {
  const initialRows = Array(20).fill({
    item: "",
    revenue: "",
    cost: "",
    profit: "",
    margin: "",
  });

  const [rows, setRows] = useState(initialRows);

  const columns = useMemo(
    () => [
      { header: "항목", accessorKey: "item", size: 150 },
      { header: "매출", accessorKey: "revenue", size: 120 },
      { header: "원가", accessorKey: "cost", size: 120 },
      { header: "손익", accessorKey: "profit", size: 120 },
      { header: "마진율", accessorKey: "margin", size: 100 },
    ],
    []
  );

  return (
    <MDBox pt={4} pb={3}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <EditableTable rows={rows} setRows={setRows} columns={columns} title="매출손익 분석" />
        </Grid>
      </Grid>
    </MDBox>
  );
}

export default SalesProfitTab;
