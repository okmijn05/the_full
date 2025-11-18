import React, { useMemo, useState } from "react";
import { Box } from "@mui/material";
import MDBox from "components/MDBox";
import EditableTable from "../../../layouts/analysis/data/edittable.js";

function CostAnalysisTab() {
  const initialRows = Array(22).fill({
    menu: "",
    cost: "",
    rate: "",
    salePrice: "",
    saleRate: "",
    note: "",
  });

  const [table1, setTable1] = useState(initialRows);
  const [table2, setTable2] = useState(initialRows);
  const [table3, setTable3] = useState(initialRows);
  const [table4, setTable4] = useState(initialRows);
  const [table5, setTable5] = useState(initialRows);

  const columns = useMemo(
    () => [
      { header: "메뉴명", accessorKey: "menu", size: 150 },
      { header: "원가", accessorKey: "cost", size: 100 },
      { header: "원가율 안", accessorKey: "rate", size: 100 },
      { header: "판매가 안", accessorKey: "salePrice", size: 120 },
      { header: "판매원가", accessorKey: "saleRate", size: 120 },
      { header: "비고", accessorKey: "note", size: 150 },
    ],
    []
  );

  return (
    <MDBox pt={0} pb={3}>
      <Box
        display="flex"
        gap={1}
        overflow="auto"
        sx={{
          "&::-webkit-scrollbar": { height: 8 },
          "&::-webkit-scrollbar-thumb": { backgroundColor: "#ccc", borderRadius: 4 },
          py: 2, // 테이블 위/아래 패딩 확보
        }}
      >
        {[table1, table2, table3, table4, table5].map((table, idx) => (
          <Box
            key={idx}
            minWidth={800} // 가로 최소 크기
            flexShrink={0}
            sx={{
              display: "flex",
              flexDirection: "column",
              backgroundColor: "#fff",
              minHeight: 300, // 높이 확보
              p: 2, // 카드 안쪽 패딩
            }}
          >
            <EditableTable
              rows={table}
              setRows={[setTable1, setTable2, setTable3, setTable4, setTable5][idx]}
              columns={columns}
              title={`단일메뉴 분석 ${idx + 1}`}
            />
          </Box>
        ))}
      </Box>
    </MDBox>
  );
}

export default CostAnalysisTab;
