// src/layouts/brandprofit/index.js
import React, { useMemo, useState } from "react";
import Grid from "@mui/material/Grid";
import MDBox from "components/MDBox";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import EditableTable from "../../../layouts/analysis/data/edittable";
import AnalysisTabs from "examples/Tabs/AnalysisTabs";

function BrandProfitTab() {
  const initialRows = Array(10).fill({
    brand: "",
    revenue: "",
    cost: "",
    profit: "",
  });

  const [rows, setRows] = useState(initialRows);

  const columns = useMemo(
    () => [
      { header: "브랜드명", accessorKey: "brand", size: 150 },
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
          <EditableTable rows={rows} setRows={setRows} columns={columns} title="브랜드별 손익 분석" />
        </Grid>
      </Grid>
    </MDBox>
  );
}

export default BrandProfitTab;
